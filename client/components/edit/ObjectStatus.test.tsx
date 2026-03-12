import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, waitFor } from "@testing-library/react";
import { ObjectStatusProps, ObjectStatus } from "./ObjectStatus";
import { EditorContextProvider, ObjectDetails } from "../../context/EditorContext";
import { FetchContextProvider } from "../../context/FetchContext";
import { GlobalContextProvider } from "../../context/GlobalContext";

describe("ObjectStatus", () => {
    let props: ObjectStatusProps;
    let lastRequestUrl: string;
    let response: ObjectDetails;

    beforeEach(() => {
        props = { pid: "foo:123" };
        response = {};
        global.fetch = jest.fn((url) => {
            lastRequestUrl = url as string;
            return {
                ok: true,
                status: 200,
                json: async function () {
                    return response;
                },
            };
        });
    });

    it("defaults to unknown state", async () => {
        const { asFragment } = render(
            <GlobalContextProvider>
                <FetchContextProvider>
                    <EditorContextProvider>
                        <ObjectStatus {...props} />
                    </EditorContextProvider>
                </FetchContextProvider>
                ,
            </GlobalContextProvider>,
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        expect(asFragment()).toMatchSnapshot();
    });

    it("displays the state found in the response", async () => {
        response.state = "Inactive";
        const { asFragment } = render(
            <GlobalContextProvider>
                <FetchContextProvider>
                    <EditorContextProvider>
                        <ObjectStatus {...props} />
                    </EditorContextProvider>
                </FetchContextProvider>
                ,
            </GlobalContextProvider>,
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        expect(asFragment()).toMatchSnapshot();
    });
});
