package expo.modules.callservice

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

/**
 * Mantiene viva la llamada (el WebView de voz) con la app en segundo plano:
 * con este servicio corriendo Android sigue entregando el audio del microfono
 * y deja reproducir el de los demas. Muestra la notificacion fija "En llamada".
 */
class CallForegroundService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val title = intent?.getStringExtra(EXTRA_TITLE) ?: DEFAULT_TITLE
    val text = intent?.getStringExtra(EXTRA_TEXT) ?: ""
    val notification = buildNotification(title, text)

    try {
      startInForeground(notification, withMicrophone = hasMicrophonePermission())
    } catch (error: SecurityException) {
      // Sin permiso de microfono Android 14 rechaza el tipo `microphone`:
      // al menos se sigue escuchando a los demas.
      startInForeground(notification, withMicrophone = false)
    }
    return START_NOT_STICKY
  }

  private fun startInForeground(notification: Notification, withMicrophone: Boolean) {
    when {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.R -> {
        val types = if (withMicrophone) {
          ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE or
            ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
        } else {
          ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
        }
        startForeground(NOTIFICATION_ID, notification, types)
      }
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q ->
        startForeground(
          NOTIFICATION_ID,
          notification,
          ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
        )
      else -> startForeground(NOTIFICATION_ID, notification)
    }
  }

  private fun hasMicrophonePermission(): Boolean =
    checkSelfPermission(Manifest.permission.RECORD_AUDIO) ==
      PackageManager.PERMISSION_GRANTED

  private fun buildNotification(title: String, text: String): Notification {
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      ensureChannel()
      Notification.Builder(this, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }
    return builder
      .setContentTitle(title)
      .setContentText(text)
      .setSmallIcon(smallIcon())
      .setContentIntent(openAppIntent())
      .setCategory(Notification.CATEGORY_CALL)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .build()
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java)
    if (manager.getNotificationChannel(CHANNEL_ID) != null) return
    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_LOW,
    ).apply { setShowBadge(false) }
    manager.createNotificationChannel(channel)
  }

  /** El icono que genera el plugin de expo-notifications; si no, el de la app. */
  private fun smallIcon(): Int {
    val notificationIcon =
      resources.getIdentifier("notification_icon", "drawable", packageName)
    return if (notificationIcon != 0) notificationIcon else applicationInfo.icon
  }

  private fun openAppIntent(): PendingIntent? {
    val launch = packageManager.getLaunchIntentForPackage(packageName) ?: return null
    return PendingIntent.getActivity(
      this,
      0,
      launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  companion object {
    const val EXTRA_TITLE = "title"
    const val EXTRA_TEXT = "text"
    private const val NOTIFICATION_ID = 4210
    private const val CHANNEL_ID = "voice-call"
    private const val CHANNEL_NAME = "Llamada en curso"
    private const val DEFAULT_TITLE = "Discordia"
  }
}
