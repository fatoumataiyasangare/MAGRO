import { shouldUseRealApi, logApiIntegrationPoint } from "./config";

export interface SMSService {
  sendOtp(phone: string, code: string): Promise<void>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

class RealSMSService implements SMSService {
  async sendOtp(phone: string, code: string): Promise<void> {
    const cfg = import.meta.env;
    const apiKey = cfg.VITE_SMS_API_KEY;
    const apiUrl = cfg.VITE_SMS_API_URL;

    if (!apiKey || !apiUrl) {
      throw new Error("SMS API credentials not configured");
    }

    void phone;
    void code;
    throw new Error("Real SMS service not yet implemented");
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    void phone;
    void code;
    return false;
  }
}

class MockSMSService implements SMSService {
  async sendOtp(phone: string, code: string): Promise<void> {
    void phone;
    void code;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    void phone;
    return /^\d{6}$/.test(code);
  }
}

function getSMSService(): SMSService {
  const useRealApi = shouldUseRealApi("sms");

  logApiIntegrationPoint(
    "SMS Service",
    useRealApi
      ? "Using the configured SMS provider."
      : "Using mock SMS mode without logging OTP values."
  );

  return useRealApi ? new RealSMSService() : new MockSMSService();
}

let smsServiceInstance: SMSService | null = null;

export async function sendOtp(phone: string, code: string): Promise<void> {
  if (!smsServiceInstance) {
    smsServiceInstance = getSMSService();
  }

  return smsServiceInstance.sendOtp(phone, code);
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (!smsServiceInstance) {
    smsServiceInstance = getSMSService();
  }

  return smsServiceInstance.verifyOtp(phone, code);
}

export function resetSMSService(): void {
  smsServiceInstance = null;
}
