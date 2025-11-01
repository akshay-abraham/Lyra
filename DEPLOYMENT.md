# 🚀 Lyra Deployment Guide

This guide provides essential steps for deploying the Lyra application, particularly when using platforms like Vercel.

## Firebase Configuration for Deployed Environments

When you deploy your application to a new environment (e.g., Vercel, Netlify), you will get a unique URL for your live site (e.g., `https://lyra-6gvk0uozm-akshay-abrahams-projects.vercel.app`).

For security reasons, Firebase Authentication will block sign-in requests from unknown domains by default. You must explicitly authorize your deployment domain.

### **Fixing `auth/unauthorized-domain` Error**

If you encounter an `auth/unauthorized-domain` error after deploying, follow these steps to resolve it:

1.  **Go to your Firebase Console**: Open your web browser and navigate to the [Firebase Console](https://console.firebase.google.com/).
2.  **Select Your Project**: Choose the Firebase project that is connected to your Lyra application (e.g., `studio-1148187791-ff9d6`).
3.  **Navigate to Authentication**: In the left-hand menu, click on **Authentication**.
4.  **Go to the "Settings" Tab**: Inside the Authentication section, click on the **Settings** tab.
5.  **Go to the "Authorized domains" section**: Click on the **Authorized domains** sub-tab.
6.  **Add Your Domain**:
    *   Click the **Add domain** button.
    *   Enter the domain of your Vercel deployment (e.g., `lyra-6gvk0uozm-akshay-abrahams-projects.vercel.app`).
    *   Click **Add**.

After adding the domain, your Google Sign-In should work correctly on your live Vercel site.

---

**Note:** You will need to repeat this step for any new deployment URL or custom domain you connect to your project.
