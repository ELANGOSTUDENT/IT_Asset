import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
export interface IItAssetManagerWebPartProps {
    assignmentWebhook: string;
    lostDeviceWebhook: string;
    warrantyExpiryWebhook: string;
    scrapEwasteWebhook: string;
    defaultCountry: string;
    defaultOffice: string;
}
export default class ItAssetManagerWebPart extends BaseClientSideWebPart<IItAssetManagerWebPartProps> {
    private _isDarkTheme;
    protected onInit(): Promise<void>;
    render(): void;
    protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void;
    protected onDispose(): void;
    protected get dataVersion(): Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=ItAssetManagerWebPart.d.ts.map