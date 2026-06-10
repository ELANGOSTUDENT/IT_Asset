import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IItAssetManagerProps {
  context: WebPartContext;
  assignmentWebhook: string;
  lostDeviceWebhook: string;
  warrantyExpiryWebhook: string;
  scrapEwasteWebhook: string;
  defaultCountry: string;
  defaultOffice: string;
  isDarkTheme: boolean;
  userDisplayName: string;
  userEmail: string;
}
