import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import PaginatorPreview from "./PaginatorPreview";

describe("PaginatorPreview", () => {
    let props;

    beforeEach(() => {
        props = {
            img: "testImage",
        };
    });

    it("renders", () => {
        const { container } = render(<PaginatorPreview {...props} />);
        expect(container.innerHTML).toContain("preview-image");
    });

    it("does not render image", () => {
        props.img = "";
        render(<PaginatorPreview {...props} />);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
});
