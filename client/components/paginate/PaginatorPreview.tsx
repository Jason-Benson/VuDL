import React from "react";

interface PaginatorPreviewProps {
    img: string | boolean;
}

const PaginatorPreview = ({ img }: PaginatorPreviewProps): React.ReactElement<any> => {
    return <div className="preview">{img ? <img className="preview-image" src={img} alt="" /> : ""}</div>;
};

export default PaginatorPreview;
