import { describe, expect, it } from "@jest/globals";
//import renderer from "react-test-renderer";
import { render } from "@testing-library/react";
import GenericError from "./GenericError";

describe("GenericError", () => {
    it("renders", () => {
        const message = "Test error";
        //const tree = renderer.create(<GenericError message={message} />).toJSON();
        const { asFragment } = render(<GenericError message={message} />);
        //expect(tree).toMatchSnapshot();
        expect(asFragment()).toMatchSnapshot();
        //expect(JSON.stringify(tree).includes(message)).toBeTruthy();
        expect(asFragment().textContent.includes(message)).toBeTruthy();
    });
});
