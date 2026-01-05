declare module 'pwa-install-handler' {
    export interface PwaInstallHandler {
        install(): Promise<boolean>;
        canInstall(): boolean;
        addListener(callback: (canInstall: boolean) => void): void;
        removeListener(callback: (canInstall: boolean) => void): void;
    }
    export const pwaInstallHandler: PwaInstallHandler;
}
