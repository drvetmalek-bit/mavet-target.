# GitHub Android Build Setup

The GitHub repository is named `drvetmalek-bit/mavet-target.` (including the trailing period). The repository contains an Android AAB workflow at `.github/workflows/android-aab.yml`; it runs on GitHub infrastructure and does not submit an EAS cloud build. A repository-scoped GitHub token used to configure the workflow needs read/write permissions for **Contents**, **Workflows**, **Secrets**, and **Actions**; these permissions are limited to this repository.

The workflow needs these GitHub Actions secrets, which are never committed to source control:

| Secret | Purpose |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded Android upload keystore. |
| `ANDROID_KEYSTORE_PASSWORD` | Password that protects the upload keystore. |
| `ANDROID_KEY_ALIAS` | Alias of the Android upload key. |
| `ANDROID_KEY_PASSWORD` | Password for the upload key. |

To build a bundle, open **Actions**, choose **Build Android AAB**, select **Run workflow**, then download the `mavet-target-release-aab` artifact after a successful run. Preserve the upload keystore and its credentials in a secure location; future Google Play updates must use the same upload key.
