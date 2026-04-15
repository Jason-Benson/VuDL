import { act } from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChildListProps, ChildList } from "./ChildList";
import { EditorContextProvider } from "../../../context/EditorContext";
import { FetchContextProvider } from "../../../context/FetchContext";

jest.mock("@mui/material/Pagination", () => () => "Pagination");
jest.mock("./Child", () => () => "Child");
jest.mock("./SelectableChild", () => () => "SelectableChild");

describe("ChildList", () => {
    let props: ChildListProps;
    let lastRequestUrl: string;
    let response;

    beforeEach(() => {
        props = { pid: "", pageSize: 10 };
        response = { numFound: 1, start: 0, docs: [{ id: "foo:124", title: "hello" }] };
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

    it("renders using ajax-loaded root data", async () => {
        let asFragment;
        await act(async () => {
            asFragment = render(
                <FetchContextProvider>
                    <EditorContextProvider>
                        <ChildList {...props} />
                    </EditorContextProvider>
                </FetchContextProvider>,
            ).asFragment;
        });
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/topLevelObjects?start=0&rows=10");
        expect(asFragment()).toMatchSnapshot();
    });

    it("allows thumbnails to be toggled on", async () => {
        const user = userEvent.setup();

        render(
            <FetchContextProvider>
                <EditorContextProvider>
                    <ChildList {...props} />
                </EditorContextProvider>
            </FetchContextProvider>,
        );

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/topLevelObjects?start=0&rows=10");

        // Wait for the toggle button to appear (component has finished loading)
        const thumbnailsButton = await waitFor(() => screen.getByRole("button", { name: /show thumbnails/i }));

        // Click it to toggle the state
        await user.click(thumbnailsButton);

        // After clicking, the button text should update
        expect(screen.getByRole("button", { name: /hide thumbnails/i })).toBeInTheDocument();
    });

    it("allows models to be toggled on", async () => {
        const user = userEvent.setup();

        render(
            <FetchContextProvider>
                <EditorContextProvider>
                    <ChildList {...props} />
                </EditorContextProvider>
            </FetchContextProvider>,
        );

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/topLevelObjects?start=0&rows=10");
        const modelsButton = await waitFor(() => screen.getByRole("button", { name: /show models/i }));
        await user.click(modelsButton);
        expect(screen.getByRole("button", { name: /hide models/i })).toBeInTheDocument();
    });

    it("allows child counts to be toggled on", async () => {
        const user = userEvent.setup();

        render(
            <FetchContextProvider>
                <EditorContextProvider>
                    <ChildList {...props} />
                </EditorContextProvider>
            </FetchContextProvider>,
        );

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/topLevelObjects?start=0&rows=10");
        const childCountsButton = await waitFor(() => screen.getByRole("button", { name: /show child counts/i }));
        await user.click(childCountsButton);
        expect(screen.getByRole("button", { name: /hide child counts/i })).toBeInTheDocument();
    });

    it("renders using SelectableChild when a callback is provided", async () => {
        props.selectCallback = jest.fn();

        render(
            <FetchContextProvider>
                <EditorContextProvider>
                    <ChildList {...props} />
                </EditorContextProvider>
            </FetchContextProvider>,
        );

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/topLevelObjects?start=0&rows=10");

        // Ensure the SelectableChild mock renders (and the normal Child does not)
        await waitFor(() => expect(screen.getByText("SelectableChild")).toBeInTheDocument());
        expect(screen.queryByText("Child")).not.toBeInTheDocument();
    });

    it("displays a paginator when appropriate", async () => {
        // with a page size of 10, the response will include 10 records, but numFound will show
        // the full result set size
        response = {
            numFound: 10000,
            start: 0,
            docs: [
                { id: "foo:124", title: "hello1" },
                { id: "foo:125", title: "hello2" },
                { id: "foo:126", title: "hello3" },
                { id: "foo:127", title: "hello4" },
                { id: "foo:128", title: "hello5" },
                { id: "foo:129", title: "hello6" },
                { id: "foo:130", title: "hello7" },
                { id: "foo:131", title: "hello8" },
                { id: "foo:132", title: "hello9" },
                { id: "foo:133", title: "hello10" },
            ],
        };
        let asFragment;
        await act(async () => {
            asFragment = render(
                <FetchContextProvider>
                    <EditorContextProvider>
                        <ChildList {...props} />
                    </EditorContextProvider>
                </FetchContextProvider>,
            ).asFragment;
        });
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/topLevelObjects?start=0&rows=10");
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders using ajax-loaded object data", async () => {
        props.pid = "foo:123";
        let asFragment;
        await act(async () => {
            asFragment = render(
                <FetchContextProvider>
                    <EditorContextProvider>
                        <ChildList {...props} />
                    </EditorContextProvider>
                </FetchContextProvider>,
            ).asFragment;
        });
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/children?start=0&rows=10");
        expect(asFragment()).toMatchSnapshot();
    });
});
