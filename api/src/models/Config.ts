import fs = require("fs");
import ini = require("ini");
import { FedoraModel, License } from "../services/FedoraCatalog";

type ConfigValue = string | string[] | ConfigRecord;
interface ConfigRecord {
    [key: string]: ConfigValue;
}

class Config {
    private static instance: Config;

    protected ini: ConfigRecord;

    constructor(ini: ConfigRecord) {
        this.ini = ini;
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            const filename = __dirname.replace(/\\/g, "/") + "/../../vudl.ini";
            let config;
            try {
                config = ini.parse(fs.readFileSync(filename, "utf-8"));
            } catch {
                console.warn(`Could not load ${filename}; defaulting to empty configuration.`);
                config = {};
            }
            // ini returns any, but we can cast it to what we need:
            Config.setInstance(new Config(config as Record<string, string>));
        }
        return Config.instance;
    }

    public static setInstance(config: Config): void {
        Config.instance = config;
    }

    get backendUrl(): string {
        return (this.ini["backend_url"] as string) ?? "http://localhost:9000";
    }

    get clientUrl(): string {
        return this.ini["client_url"] as string;
    }

    get fedoraUsername(): string {
        return this.ini["fedora_username"] as string;
    }

    get fedoraPassword(): string {
        return this.ini["fedora_password"] as string;
    }

    get fedoraPidNameSpace(): string {
        return this.ini["fedora_pid_namespace"] as string;
    }

    get ffmpegPath(): string {
        return this.ini["ffmpeg_path"] as string;
    }

    get fitsCommand(): string {
        return this.ini["fits_command"] as string;
    }

    get sessionKey(): string {
        return (this.ini["session_key"] as string) ?? "vanilla hot cocoa";
    }

    get tesseractPath(): string {
        return this.ini["tesseract_path"] as string;
    }

    get tesseractAllowedChars(): string {
        return this.ini["tesseract_allowed_characters"] as string;
    }

    get vufindUrl(): string {
        return (this.ini["vufind_url"] as string) ?? "";
    }

    get pdfDirectory(): string {
        return this.ini["pdf_directory"] as string;
    }

    get textcleanerPath(): string {
        return this.ini["textcleaner_path"] as string;
    }

    get textcleanerSwitches(): string {
        return this.ini["textcleaner_switches"] as string;
    }

    get holdingArea(): string {
        const holdingArea = this.ini["holding_area_path"] as string;
        return holdingArea.endsWith("/") ? holdingArea : holdingArea + "/";
    }

    get ocrmypdfPath(): string {
        return this.ini["ocrmypdf_path"] as string;
    }

    get processedAreaPath(): string {
        return this.ini["processed_area_path"] as string;
    }

    get restBaseUrl(): string {
        return this.ini["base_url"] as string;
    }

    get javaPath(): string {
        return (this.ini["java_path"] as string) ?? "java";
    }

    get tikaConfigFile(): string | null {
        return (this.ini["tika_config_file"] as string) ?? null;
    }

    get tikaPath(): string {
        return this.ini["tika_path"] as string;
    }

    get solrCore(): string {
        return (this.ini["solr_core"] as string) ?? "biblio";
    }

    get solrUrl(): string {
        return (this.ini["solr_url"] as string) ?? "http://localhost:8983/solr";
    }

    get solrDocumentCacheDir(): boolean | string {
        return (this.ini["solr_document_cache_dir"] as string) ?? false;
    }

    get allowedOrigins(): string[] {
        return (this.ini["allowed_origins"] as string[]) ?? [];
    }

    get pidNamespace(): string {
        return (this.ini["fedora_pid_namespace"] as string) ?? "vudl";
    }

    get initialPidValue(): number {
        return parseInt((this.ini["fedora_initial_pid"] as string) ?? "0");
    }

    get dataModels(): Record<string, string> {
        return (
            (this.ini["data_models"] as Record<string, string>) ?? {
                Image: "vudl-system:ImageData",
                PDF: "vudl-system:PDFData",
                DOC: "vudl-system:DOCData",
                Audio: "vudl-system:AudioData",
                Video: "vudl-system:VideoData",
                XLS: "vudl-system:XLSData",
                Text: "vudl-system:TextData",
            }
        );
    }

    get collectionModels(): Record<string, string> {
        return (
            (this.ini["collection_models"] as Record<string, string>) ?? {
                List: "vudl-system:ListCollection",
                Resource: "vudl-system:ResourceCollection",
                Folder: "vudl-system:FolderCollection",
            }
        );
    }

    get institution(): string {
        return (this.ini["institution"] as string) ?? "My University";
    }

    get collection(): string {
        return (this.ini["collection"] as string) ?? "Digital Library";
    }

    get topLevelPids(): Array<string> {
        return (this.ini["top_level_pids"] as string[]) ?? [];
    }

    get articlesToStrip(): Array<string> {
        return (this.ini["articles_to_strip"] as string[]) ?? [];
    }

    get trashPid(): string | null {
        return (this.ini["trash_pid"] as string) ?? null;
    }

    get favoritePids(): Array<string> {
        const favorites = (this.ini["favorite_pids"] as string[]) ?? [];
        const trash = this.trashPid;
        if (trash && !favorites.includes(trash)) {
            favorites.push(trash);
        }
        return favorites;
    }

    get languageMap(): Record<string, string> {
        return (this.ini["LanguageMap"] as Record<string, string>) ?? {};
    }

    get minimumValidYear(): number {
        return parseInt((this.ini["minimum_valid_year"] as string) ?? "1000");
    }

    get models(): Record<string, FedoraModel> {
        return (this.ini["models"] as unknown as Record<string, FedoraModel>) || {};
    }

    get databaseSettings(): ConfigRecord {
        return (this.ini["Database"] as ConfigRecord) ?? {};
    }

    get databaseClient(): string {
        return (this.databaseSettings["client"] as string) ?? "sqlite3";
    }

    get databaseConnectionSettings(): ConfigRecord {
        return (this.databaseSettings["connection"] as ConfigRecord) ?? { filename: "./data/auth.sqlite3" };
    }

    get authenticationSettings(): ConfigRecord {
        return (this.ini["Authentication"] as ConfigRecord) ?? {};
    }

    get authenticationStrategy(): string {
        return (this.authenticationSettings["strategy"] as string) ?? "local";
    }

    get authenticationHashAlgorithm(): string {
        return (this.authenticationSettings["hash_algorithm"] as string) ?? "sha1";
    }

    get authenticationLegalUsernames(): Array<string> {
        return (this.authenticationSettings["legal_usernames"] as Array<string>) ?? [];
    }

    get authenticationRequirePasswords(): boolean {
        if (typeof this.authenticationSettings["require_passwords"] === "boolean") {
            return this.authenticationSettings["require_passwords"];
        }
        const stringValue = (this.authenticationSettings["require_passwords"] as string) ?? "true";
        return stringValue.trim().toLowerCase() !== "false";
    }

    get authenticationSalt(): string {
        return (this.authenticationSettings["salt"] as string) ?? "VuDLSaltValue";
    }

    get databaseInitialUsers(): Record<string, string> {
        return (this.authenticationSettings["initial_users"] ?? []) as Record<string, string>;
    }

    get samlCertificate(): string {
        return (this.authenticationSettings["saml_certificate"] as string) ?? "";
    }

    get samlEntryPoint(): string {
        return (this.authenticationSettings["saml_entry_point"] as string) ?? "";
    }

    get licenses(): Record<string, License> {
        return (this.ini["licenses"] as unknown as Record<string, License>) ?? {};
    }

    get agentDefaults(): Record<string, string> {
        return ((this.ini["agent"] as ConfigRecord)?.["defaults"] as Record<string, string>) ?? {};
    }

    get agentRoles(): Array<string> {
        return ((this.ini["agent"] as ConfigRecord)?.["roles"] as string[]) ?? [];
    }

    get agentTypes(): Array<string> {
        return ((this.ini["agent"] as ConfigRecord)?.["types"] as string[]) ?? [];
    }

    get dublinCoreFields(): Record<string, Record<string, string | Array<string>>> {
        return (this.ini["dublin_core"] as Record<string, Record<string, string | Array<string>>>) ?? {};
    }

    get redisConnectionSettings(): Record<string, string> {
        return ((this.ini["queue"] as ConfigRecord)?.["connection"] as Record<string, string>) ?? {};
    }

    get redisDefaultQueueName(): string {
        return ((this.ini["queue"] as ConfigRecord)?.["defaultQueueName"] as string) ?? "vudl";
    }

    get redisQueueJobMap(): Record<string, string> {
        return ((this.ini["queue"] as ConfigRecord)?.["jobMap"] as Record<string, string>) ?? {};
    }

    get redisLockDuration(): number {
        return parseInt(((this.ini["queue"] as ConfigRecord)?.["lockDuration"] as string) ?? "30000");
    }

    get processMetadataDefaults(): Record<string, string> {
        return (this.ini["process_metadata_defaults"] as Record<string, string>) ?? {};
    }

    get toolPresets(): Array<Record<string, string>> {
        return (this.ini["tool_presets"] as unknown as Array<Record<string, string>>) ?? [];
    }

    get sharpOptions(): Record<string, unknown> {
        const pixelLimit = ((this.ini["sharp"] as ConfigRecord)?.["limitInputPixels"] as string) ?? "268402689";
        return {
            limitInputPixels: parseInt(pixelLimit),
        };
    }

    get max409Retries(): number {
        return (this.ini["max_409_retries"] as unknown as number) ?? 3;
    }

    get maxUploadSize(): number {
        return ((this.ini["upload"] as ConfigRecord)?.["sizeLimit"] as unknown as number) ?? 200 * 1024 * 1024;
    }

    get notifyMethod(): string {
        return ((this.ini["notify"] as ConfigRecord)?.["method"] as string) ?? "ntfy";
    }

    get ntfyConfig(): Record<string, string> {
        return {
            defaultChannel: ((this.ini["notify"] as ConfigRecord)?.["ntfy_defaultChannel"] as string) ?? "vudl-ntfy",
        };
    }

    get indexerLockRetries(): number {
        return parseInt(((this.ini["indexer"] as ConfigRecord)?.["lockRetries"] as string) ?? "60");
    }

    get indexerLockWaitMs(): number {
        return parseInt(((this.ini["indexer"] as ConfigRecord)?.["lockWaitMs"] as string) ?? "1000");
    }

    get indexerExceptionRetries(): number {
        return parseInt(((this.ini["indexer"] as ConfigRecord)?.["exceptionRetries"] as string) ?? "10");
    }

    get indexerExceptionWaitMs(): number {
        return parseInt(((this.ini["indexer"] as ConfigRecord)?.["exceptionWaitMs"] as string) ?? "500");
    }
}

export default Config;
