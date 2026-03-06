import React from "react";
import EditHome from "../../components/edit/EditHome";
import { EditorContextProvider } from "../../context/EditorContext";

export default function Object(): React.ReactElement<any> {
    return (
        <EditorContextProvider>
            <EditHome />
        </EditorContextProvider>
    );
}
