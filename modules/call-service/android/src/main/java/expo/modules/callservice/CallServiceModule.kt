package expo.modules.callservice

import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Expone a JS el servicio en primer plano de la llamada. Sin ese servicio,
 * Android le da silencio al microfono apenas la app pasa a segundo plano.
 */
class CallServiceModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CallService")

    // Tiene que llamarse con la app abierta: Android 12+ no deja arrancar un
    // servicio en primer plano desde segundo plano.
    Function("start") { title: String, text: String ->
      val context = appContext.reactContext ?: return@Function false
      val intent = Intent(context, CallForegroundService::class.java)
        .putExtra(CallForegroundService.EXTRA_TITLE, title)
        .putExtra(CallForegroundService.EXTRA_TEXT, text)
      try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
        true
      } catch (error: Exception) {
        false
      }
    }

    Function("stop") {
      val context = appContext.reactContext ?: return@Function
      context.stopService(Intent(context, CallForegroundService::class.java))
    }
  }
}
