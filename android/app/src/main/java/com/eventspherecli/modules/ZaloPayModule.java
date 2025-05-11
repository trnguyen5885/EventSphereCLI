package com.eventspherecli.modules;
import static android.content.ContentValues.TAG;

import android.app.Activity;
import android.nfc.Tag;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;

import vn.zalopay.sdk.ZaloPayError;
import vn.zalopay.sdk.ZaloPaySDK;
import vn.zalopay.sdk.Environment;
import vn.zalopay.sdk.listeners.PayOrderListener;

public class ZaloPayModule extends ReactContextBaseJavaModule {
    public ZaloPayModule(ReactApplicationContext reactContext) {
        super(reactContext);
        // Khởi tạo SDK (thường để trong MainActivity tốt hơn)
        ZaloPaySDK.init(2554, Environment.SANDBOX); // app_id của bạn, SANDBOX hoặc PRODUCTION
    }

    @Override
    public String getName() {
        return "ZaloPayModule"; // tên này để JS gọi
    }

    @ReactMethod
    public void payOrder(String zpTransToken,  Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
                return;
            }

            // Sử dụng URL scheme của ứng dụng thực tế của bạn
            String appScheme = "demozpdk://app"; // Thay thế bằng scheme của bạn

            ZaloPaySDK.getInstance().payOrder(currentActivity, zpTransToken, appScheme, new PayOrderListener() {
                @Override
                public void onPaymentSucceeded(String transactionId, String transToken, String appTransID) {
                    WritableMap resultMap = Arguments.createMap();
                    resultMap.putString("transactionId", transactionId);
                    resultMap.putString("transToken", transToken);
                    resultMap.putString("appTransID", appTransID);
                    resultMap.putString("status", "success");
                    Log.d(TAG, "payOrder called with token: " + resultMap);
                    promise.resolve(resultMap);
                }

                @Override
                public void onPaymentCanceled(String transToken, String appTransID) {
                    WritableMap resultMap = Arguments.createMap();
                    resultMap.putString("transToken", transToken);
                    resultMap.putString("appTransID", appTransID);
                    resultMap.putString("status", "cancelled");
                    Log.d(TAG, "payOrder called with token: " + resultMap);
                    promise.reject("PAYMENT_CANCELLED", "Payment Cancelled", resultMap);
                }

                @Override
                public void onPaymentError(ZaloPayError error, String transToken, String appTransID) {
                    WritableMap resultMap = Arguments.createMap();
                    resultMap.putString("errorCode", error.toString());
                    resultMap.putString("transToken", transToken);
                    resultMap.putString("appTransID", appTransID);
                    resultMap.putString("status", "error");
                    Log.d(TAG, "payOrder called with token: " + resultMap);
                    promise.reject("PAYMENT_ERROR", "Payment Failed: " + error.toString(), resultMap);
                }
            });
        } catch (Exception e) {
            promise.reject("E_PAYMENT_ERROR", e.getMessage());
        }
    }
}
