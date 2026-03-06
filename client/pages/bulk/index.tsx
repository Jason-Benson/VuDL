import React from "react";
import BulkEditor from "../../components/bulk/BulkEditor";
import { EditorContextProvider } from "../../context/EditorContext";

export default function Object(): React.ReactElement<any> {
    return (
        <EditorContextProvider>
            <BulkEditor />
        </EditorContextProvider>
    );
}
