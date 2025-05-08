package com.eventspherecli.modules;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

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
    public void payOrder(String zpTransToken, final Promise promise) {
        ZaloPaySDK.getInstance().payOrder(getCurrentActivity(), zpTransToken, "demozpdk://app", new PayOrderListener() {
            @Override
            public void onPaymentSucceeded(String transactionId, String transToken, String appTransID) {
                promise.resolve("Payment Success: " + transactionId);
            }

            @Override
            public void onPaymentCanceled(String transToken, String appTransID) {
                promise.reject("PAYMENT_CANCELLED", "Payment Cancelled");
            }

            @Override
            public void onPaymentError(ZaloPayError error, String transToken, String appTransID) {
                promise.reject("PAYMENT_ERROR", "Payment Failed: " + error.toString());
            }
        });
    }
}
