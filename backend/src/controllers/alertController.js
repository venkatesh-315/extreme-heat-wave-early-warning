const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const Location = require('../models/Location');
const { MULTILINGUAL_SMS_TEMPLATES } = require('../services/alertEngineService');
const { sendNotificationToAllUsers } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const DEFAULT_ALERTS = [
  {
    _id: 'alt-default-red-01',
    title: 'RED ALERT — Severe Heatwave & Loo Winds in Delhi NCR & Rajasthan',
    level: 'RED',
    code: 'RED_WARNING',
    severity: 'Extreme',
    category: 'Extreme Heatwave',
    message: 'Ambient temperatures surpassing 45°C with severe thermal stress (WBGT > 33°C). Mandatory work stoppage during 11 AM – 4:30 PM.',
    publicHealthAdvisory: 'Stay indoors, consume electrolyte solutions, keep livestock shaded.',
    targetLocationNames: ['New Delhi', 'Phalodi', 'Barmer', 'Gurugram', 'Noida'],
    isActive: true,
    issuedBy: 'IMD / NDMA Heat Disaster Control Room',
    issuedAt: new Date().toISOString(),
  },
  {
    _id: 'alt-default-org-02',
    title: 'ORANGE ALERT — High Compound Heat & Humidity in Coastal Andhra & Bengal',
    level: 'ORANGE',
    code: 'ORANGE_ALERT',
    severity: 'Severe',
    category: 'Compound Heat Stress',
    message: 'Apparent temperature feels like 48°C due to 75%+ relative humidity. High heat exhaustion risk.',
    publicHealthAdvisory: 'Open community cooling shelters and replenish municipal drinking water stations.',
    targetLocationNames: ['Visakhapatnam', 'Kolkata', 'Bhubaneswar', 'Vijayawada'],
    isActive: true,
    issuedBy: 'State Disaster Management Authority (SDMA)',
    issuedAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

/**
 * Get All Active Alerts
 * GET /api/alerts
 */
const getActiveAlerts = async (req, res, next) => {
  try {
    const { level, severity } = req.query;
    let alerts = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const filter = { isActive: true };
        if (level) filter.level = level.toUpperCase();
        if (severity) filter.severity = severity;
        alerts = await Alert.find(filter).sort({ issuedAt: -1 });
      } catch {
        // Fallback
      }
    }

    if (alerts.length === 0) {
      alerts = DEFAULT_ALERTS;
      if (level) alerts = alerts.filter((a) => a.level === level.toUpperCase());
      if (severity) alerts = alerts.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
    }

    return successResponse(res, alerts, 'Active heatwave alerts retrieved', 200, { count: alerts.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Alerts by Location ID or Name
 * GET /api/alerts/location/:id
 */
const getAlertsByLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let alerts = [];

    if (mongoose.connection.readyState === 1) {
      try {
        alerts = await Alert.find({
          isActive: true,
          $or: [
            { targetLocations: id },
            { targetLocationNames: new RegExp(id, 'i') },
          ],
        });
      } catch {
        // Ignore
      }
    }

    if (alerts.length === 0) {
      alerts = [
        {
          _id: `alt-loc-${id}`,
          title: `RED ALERT — Severe Thermal Warning for Selected Area`,
          level: 'RED',
          code: 'RED_WARNING',
          severity: 'Extreme',
          category: 'Extreme Heatwave',
          message: 'Heat index and wet-bulb globe temperature have breached emergency intervention thresholds.',
          publicHealthAdvisory: 'Mandatory halt on heavy physical exertion between 11:00 AM and 4:30 PM.',
          issuedBy: 'National Heat Wave Early Warning Desk',
          issuedAt: new Date().toISOString(),
        }
      ];
    }

    return successResponse(res, alerts, 'Location alerts retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * Create New Alert (Authority / Admin)
 * POST /api/alerts
 */
const createAlert = async (req, res, next) => {
  try {
    const { title, level, severity, category, message, publicHealthAdvisory, targetLocationNames, targetLocations, expiresHours } = req.body;

    const alertLevel = (level || 'RED').toUpperCase();
    const alertSeverity = severity || (alertLevel === 'RED' ? 'Extreme' : alertLevel === 'ORANGE' ? 'Severe' : 'Moderate');

    const alertData = {
      title: title.trim(),
      level: alertLevel,
      code: `${alertLevel}_WARNING`,
      severity: alertSeverity,
      category: category || 'Extreme Heatwave',
      message: message.trim(),
      publicHealthAdvisory: publicHealthAdvisory || 'Take immediate heat precautions.',
      targetLocationNames: targetLocationNames || ['All Active Districts'],
      targetLocations: targetLocations || [],
      issuedBy: req.user?.name ? `${req.user.name} (${req.user.department || 'Disaster Control'})` : 'IMD / NDMA Heat Disaster Control Room',
      expiresAt: new Date(Date.now() + (parseInt(expiresHours, 10) || 24) * 3600000),
      isActive: true,
      issuedAt: new Date().toISOString(),
    };

    let createdAlert;
    if (mongoose.connection.readyState === 1) {
      createdAlert = await Alert.create(alertData);
    } else {
      createdAlert = { _id: `alt_${Date.now()}`, ...alertData };
    }

    // Trigger asynchronous FCM push notification without blocking HTTP response
    sendNotificationToAllUsers({
      title: createdAlert.title,
      body: createdAlert.message,
      data: {
        type: 'heatwave_alert',
        alertId: String(createdAlert._id),
        level: createdAlert.level,
        severity: createdAlert.severity,
      },
      priority: createdAlert.level === 'RED' ? 'high' : 'normal',
      requireInteraction: createdAlert.level === 'RED',
      url: '/alerts',
    }).catch((err) => {
      // Non-blocking log
      console.error('FCM alert dispatch notice:', err.message);
    });

    return successResponse(res, createdAlert, 'Heatwave alert successfully issued and registered', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Multi-lingual SMS & WhatsApp Templates
 * GET /api/alerts/sms-templates
 */
const getSmsTemplates = async (req, res) => {
  return successResponse(
    res,
    MULTILINGUAL_SMS_TEMPLATES,
    'Multi-lingual alert templates retrieved'
  );
};

/**
 * Broadcast Emergency Alert Simulation
 * POST /api/alerts/broadcast
 */
const broadcastAlert = async (req, res, next) => {
  try {
    const { templateId, channels = ['sms', 'whatsapp', 'push'], targetDistrict } = req.body;

    const template = MULTILINGUAL_SMS_TEMPLATES.find((t) => t.id === templateId) || MULTILINGUAL_SMS_TEMPLATES[0];

    const broadcastResult = {
      dispatchId: `DISP-${Date.now().toString(36).toUpperCase()}`,
      templateUsed: template.label,
      targetDistrict: targetDistrict || 'All High-Risk Hotspot Wards',
      channelsBroadcasted: channels,
      estimatedRecipients: 245000,
      deliveryStatus: 'QUEUED_FOR_BROADCAST',
      timestamp: new Date().toISOString(),
      dispatchedBy: req.user?.name || 'Duty Disaster Officer',
    };

    // Dispatch FCM broadcast if push channel requested
    if (channels.includes('push') || channels.includes('fcm')) {
      sendNotificationToAllUsers({
        title: `NDMA Directive: ${template.label}`,
        body: template.content,
        data: {
          type: 'emergency_broadcast',
          templateId: template.id,
          targetDistrict: broadcastResult.targetDistrict,
        },
        priority: 'high',
        requireInteraction: true,
        url: '/action',
      }).catch((err) => {
        console.error('FCM broadcast notice:', err.message);
      });
    }

    return successResponse(res, broadcastResult, 'Emergency alert broadcast simulation dispatched');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActiveAlerts,
  getAlertsByLocation,
  createAlert,
  getSmsTemplates,
  broadcastAlert,
};
