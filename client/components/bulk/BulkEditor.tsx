import React, { useEffect, useState } from "react";
import { baseUrl, objectDatastreamLicenseUrl } from "../../util/routes";
import { getObjectDetailsUrl, objectDatastreamDublinCoreUrl } from "../../util/routes";
import { useFetchContext } from "../../context/FetchContext";
import { useEditorContext } from "../../context/EditorContext";
import BasicBreadcrumbs from "../shared/BasicBreadcrumbs";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import BlurSavingTextField from "../shared/BlurSavingTextField";

const BulkEditor = (): React.ReactElement => {
    const {
        state: { licensesCatalog, dublinCoreFieldCatalog },
        action: { initializeCatalog },
    } = useEditorContext();
    const [results, setResults] = useState("");
    const [selectedRecords, setSelectedRecords] = useState("");
    const [licenseKey, setLicenseKey] = useState("");
    const [topPid, setTopPid] = useState("");
    const [query, setQuery] = useState("");
    const [limit, setLimit] = useState("50");
    const [selectedRecordIds, setSelectedRecordIds] = useState<Array<string>>([]);
    const [findString, setFindString] = useState("");
    const [replaceString, setReplaceString] = useState("");
    const [replaceField, setReplaceField] = useState("");
    const [dcField, setDcField] = useState("dc:title");
    const {
        action: { fetchJSON, fetchText },
    } = useFetchContext();

    useEffect(() => {
        initializeCatalog();
    }, []);

    const doFetchRecords = async () => {
        try {
            const queryParts = [];
            if (query.trim().length > 0) {
                queryParts.push(`(${query.trim()})`);
            }
            const trimmedTopPid = topPid.trim();
            if (trimmedTopPid.length > 0) {
                queryParts.push(`(id:"${trimmedTopPid}" OR hierarchy_all_parents_str_mv:"${trimmedTopPid}")`);
            }
            const combinedQuery = queryParts.join(" AND ");
            const result = await fetchText(
                baseUrl + "/api/edit/query/solr",
                { method: "POST", body: JSON.stringify({ query: combinedQuery, rows: parseInt(limit) }) },
                { "Content-Type": "application/json" },
            );
            const json = JSON.parse(result);
            let text = "";
            const newSelectedRecordIds: Array<string> = [];
            if (json.numFound < 1) {
                text = "No results found.";
            } else {
                json.docs.forEach((doc) => {
                    text += `${doc.id}:\t${doc.title}\n`;
                    newSelectedRecordIds.push(doc.id);
                });
            }
            setSelectedRecords(text);
            setSelectedRecordIds(newSelectedRecordIds);
        } catch (error) {
            setSelectedRecords(error.message);
        }
        setResults("");
    };

    const doApplyChanges = async () => {
        try {
            if (licenseKey == "") {
                setResults("No change requested.");
                return;
            }
            if (selectedRecordIds.length < 1) {
                setResults("No records selected.");
                return;
            }
            let result = "";
            for (let i = 0; i < selectedRecordIds.length; i++) {
                const id = selectedRecordIds[i];
                const text = await fetchText(
                    objectDatastreamLicenseUrl(id, "LICENSE"),
                    {
                        method: "POST",
                        body: JSON.stringify({
                            licenseKey,
                        }),
                    },
                    { "Content-Type": "application/json" },
                );
                result += `(${i + 1}/${selectedRecordIds.length}) ${id}: ${text}\n`;
                setResults(result);
            }
        } catch (error) {
            setResults(error.message);
        }
    };
    const getFieldReplacements = async () => {
        const replacements = [];
        for (const id of selectedRecordIds) {
            const details = await fetchJSON(getObjectDetailsUrl(id));
            const metadata = details.metadata ?? {};
            const oldValues = metadata[dcField] ?? [];
            if (replaceField != "") {
                const newValues = [replaceField];
                replacements.push({ id, metadata, oldValues, newValues });
            } else {
                if (oldValues.some((value) => value.includes(findString))) {
                    const newValues = oldValues.map((value) => value.replaceAll(findString, replaceString));
                    replacements.push({ id, metadata, oldValues, newValues });
                }
            }
        }
        return replacements;
    };
    const isReplacementFormValid = async (replacements: any[]) => {
        if (findString == "") {
            setResults("No search string provided.");
            return false;
        }
        if (replaceString == "" && replaceField == "") {
            setResults("No replacement string provided.");
            return false;
        }
        if (selectedRecordIds.length < 1) {
            setResults("No records selected.");
            return false;
        }
        if (replacements.length < 1) {
            setResults(`No matches for "${findString}" in ${dcField}.`);
            return false;
        }
        return true;
    };
    const doPreviewFieldText = async () => {
        try {
            const replacements = await getFieldReplacements();
            if (!isReplacementFormValid(replacements)) {
                return;
            }
            setResults(
                replacements
                    .map(
                        ({ id, oldValues, newValues }) =>
                            `${id}:\n  Old: ${oldValues.join(" | ")}\n  New: ${newValues.join(" | ")}\n`,
                    )
                    .join(""),
            );
        } catch (error) {
            setResults(error.message);
        }
    };
    const doReplaceFieldText = async () => {
        try {
            const replacements = await getFieldReplacements();  
            if (!isReplacementFormValid(replacements)) {
                return;
            }
            let result = "";
            for (let i = 0; i < replacements.length; i++) {
                const { id, metadata, newValues } = replacements[i];
                metadata[dcField] = newValues;
                const text = await fetchText(
                    objectDatastreamDublinCoreUrl(id, "DC"),
                    { method: "POST", body: JSON.stringify({ metadata }) },
                    { "Content-Type": "application/json" },
                );
                result += `(${i + 1}/${replacements.length}) ${id}: ${text}\n`;
                setResults(result);
            }
        } catch (error) {
            setResults(error.message);
        }
    };

    return (
        <div>
            <BasicBreadcrumbs />
            <h1>Bulk Editor</h1>
            <h2>Record Selector</h2>
            <FormControl fullWidth>
                <BlurSavingTextField
                    value={topPid}
                    setValue={setTopPid}
                    options={{ id: "outlined-basic", label: "Top Level PID", variant: "outlined" }}
                />
            </FormControl>
            <FormControl fullWidth>
                <BlurSavingTextField
                    value={query}
                    setValue={setQuery}
                    options={{ id: "outlined-basic", label: "Search Query", variant: "outlined" }}
                />
            </FormControl>
            <FormControl fullWidth>
                <BlurSavingTextField
                    value={limit}
                    setValue={setLimit}
                    options={{ id: "outlined-basic", label: "Result Limit", variant: "outlined" }}
                />
            </FormControl>
            <FormControl>
                <button onClick={() => doFetchRecords()}>Fetch Records</button>
            </FormControl>
            <p>{`${selectedRecordIds.length} selected.`}</p>
            <pre title="Selected Records" id="selectedRecords">
                {selectedRecords}
            </pre>
            <h2>Changes to Apply</h2>
            <FormControl fullWidth>
                <InputLabel>Choose New License</InputLabel>
                <Select
                    label="Choose New License"
                    value={licenseKey}
                    onChange={(event) => setLicenseKey(event.target.value)}
                >
                    <MenuItem key="nochange" value="">
                        Do not change license.
                    </MenuItem>
                    {Object.entries(licensesCatalog).map(([key, license]) => {
                        return (
                            <MenuItem key={key} value={key}>
                                {license.name}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
            <FormControl>
                <button id="bulkEditSubmit" onClick={() => doApplyChanges()}>
                    Apply Changes
                </button>
            </FormControl>
            <h2>Replace Text in DC Field</h2>
            <FormControl fullWidth>
                <InputLabel>Field</InputLabel>
                <Select label="Field" value={dcField} onChange={(event) => setDcField(event.target.value)}>
                    {Object.entries(dublinCoreFieldCatalog)
                        .filter(([, field]) => field.type !== "locked")
                        .map(([key, field]) => (
                            <MenuItem key={key} value={key}>
                                {field.label}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <BlurSavingTextField
                    value={findString}
                    setValue={setFindString}
                    options={{ id: "outlined-basic", label: "Find", variant: "outlined" }}
                />
            </FormControl>
            <FormControl fullWidth>
                <BlurSavingTextField
                    value={replaceString}
                    setValue={setReplaceString}
                    options={{ id: "outlined-basic", label: "Replace With", variant: "outlined" }}
                />
            </FormControl>
            <FormControl fullWidth>
                <BlurSavingTextField
                    value={replaceField}
                    setValue={setReplaceField}
                    options={{ id: "outlined-basic", label: "Replace Whole Field With", variant: "outlined" }}
                />
            </FormControl>
            <FormControl>
                <button onClick={() => doPreviewFieldText()}>Preview Changes</button>
            </FormControl>
            <FormControl>
                <button onClick={() => doReplaceFieldText()}>Replace in Field</button>
            </FormControl>
            <h2>Results:</h2>
            <pre title="Bulk Edit Results" id="bulkEditResults">
                {results}
            </pre>
        </div>
    );
};

export default BulkEditor;
