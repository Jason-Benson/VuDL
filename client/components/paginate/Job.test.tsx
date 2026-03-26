import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import { FetchContextProvider } from "../../context/FetchContext";
import Job from "./Job";

const mockjobClickable = jest.fn();
jest.mock(
    "./JobClickable",
    () =>
        function JobClickable(props) {
            mockjobClickable(props);
            return "JobClickable";
        },
);

describe("Job", () => {
    let props;

    beforeEach(() => {
        props = {
            data: {
                category: "testCategory",
                children: "testChildren",
            },
        };
    });

    it("renders", () => {
        // const tree = renderer.create(
        //     <FetchContextProvider>
        //         <Job {...props} />
        //     </FetchContextProvider>,
        // );
        // expect(tree.toJSON()).toMatchSnapshot();
        const { asFragment } = render(
            <FetchContextProvider>
                <Job {...props} />
            </FetchContextProvider>,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
