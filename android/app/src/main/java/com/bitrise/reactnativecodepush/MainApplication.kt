package com.bitrise.reactnativecodepush

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.microsoft.codepush.react.CodePush

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
      // RN 0.82+ uses ReactHost config instead of overriding getJSBundleFile().
      // CodePush resolves the JS bundle path at startup (OTA update if available,
      // falling back to the bundled JS otherwise).
      jsBundleFilePath = CodePush.getJSBundleFile(),
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
