import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneLabel,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import ItAssetManager from './components/ItAssetManager';
import { IItAssetManagerProps } from './components/IItAssetManagerProps';

export interface IItAssetManagerWebPartProps {
  assignmentWebhook: string;
  lostDeviceWebhook: string;
  warrantyExpiryWebhook: string;
  scrapEwasteWebhook: string;
  defaultCountry: string;
  defaultOffice: string;
}

export default class ItAssetManagerWebPart extends BaseClientSideWebPart<IItAssetManagerWebPartProps> {
  private _isDarkTheme = false;

  protected async onInit(): Promise<void> {
    return super.onInit();
  }

  public render(): void {
    const element: React.ReactElement<IItAssetManagerProps> = React.createElement(ItAssetManager, {
      context: this.context,
      assignmentWebhook:     this.properties.assignmentWebhook     || '',
      lostDeviceWebhook:     this.properties.lostDeviceWebhook     || '',
      warrantyExpiryWebhook: this.properties.warrantyExpiryWebhook || '',
      scrapEwasteWebhook:    this.properties.scrapEwasteWebhook    || '',
      defaultCountry: this.properties.defaultCountry || 'IN',
      defaultOffice:  this.properties.defaultOffice  || 'GIC',
      isDarkTheme:    this._isDarkTheme,
      userDisplayName: this.context.pageContext.user.displayName,
      userEmail:       this.context.pageContext.user.email,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;
    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;
    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText',    semanticColors.bodyText    || null);
      this.domElement.style.setProperty('--link',        semanticColors.link        || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'IT Asset Manager Settings' },
          groups: [
            {
              groupName: 'Office Configuration',
              groupFields: [
                PropertyPaneTextField('defaultCountry', {
                  label: 'Country Code',
                  description: 'e.g. IN',
                  maxLength: 5,
                }),
                PropertyPaneTextField('defaultOffice', {
                  label: 'Site / Office Code',
                  description: 'e.g. GIC for Global Infocity Chennai',
                  maxLength: 5,
                }),
              ],
            },
            {
              groupName: 'Power Automate Webhooks (HTTP Request trigger URLs)',
              groupFields: [
                PropertyPaneLabel('webhookHint', {
                  text: 'Paste the HTTP POST URL from each Power Automate flow below.',
                }),
                PropertyPaneTextField('assignmentWebhook', {
                  label: 'Asset Assignment Notification',
                  multiline: true, rows: 2,
                }),
                PropertyPaneTextField('lostDeviceWebhook', {
                  label: 'Lost / Stolen Device Alert',
                  multiline: true, rows: 2,
                }),
                PropertyPaneTextField('warrantyExpiryWebhook', {
                  label: 'Warranty Expiry (90-day check)',
                  multiline: true, rows: 2,
                }),
                PropertyPaneTextField('scrapEwasteWebhook', {
                  label: 'Scrap / E-Waste Disposal',
                  multiline: true, rows: 2,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
