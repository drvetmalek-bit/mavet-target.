# GitHub Android Build Setup

The GitHub repository is named `drvetmalek-bit/mavet-target.` (including the trailing period). The repository contains both an Android AAB workflow at `.github/workflows/android-aab.yml` and an installable Android APK workflow at `.github/workflows/android-apk.yml`; both run on GitHub infrastructure and do not submit an EAS cloud build. A repository-scoped GitHub token used to configure the workflows needs read/write permissions for **Contents**, **Workflows**, **Secrets**, and **Actions**; these permissions are limited to this repository.

The workflow needs these GitHub Actions secrets, which are never committed to source control:

| Secret | Purpose |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded Android upload keystore. |
| `ANDROID_KEYSTORE_PASSWORD` | Password that protects the upload keystore. |
| `ANDROID_KEY_ALIAS` | Alias of the Android upload key. |
| `ANDROID_KEY_PASSWORD` | Password for the upload key. |

To build a bundle, open **Actions**, choose **Build Android AAB**, select **Run workflow**, then download the `mavet-target-release-aab` artifact after a successful run. Preserve the upload keystore and its credentials in a secure location; future Google Play updates must use the same upload key.

To install the app directly on an Android phone, open **Actions**, choose **Build Android APK**, select **Run workflow**, then download the `mavet-target-release-apk` artifact after a successful run. Extract the downloaded archive, transfer `app-release.apk` to the phone, and allow installation from the browser or file manager when Android requests permission. The workflow verifies the APK signature before upload. The Android package is `com.mavetpharma.mavettarget`; this lets the direct-install build be installed independently from previous Expo-signed builds that used a different signing certificate.
