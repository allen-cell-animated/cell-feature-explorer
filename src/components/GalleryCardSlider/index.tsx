import { Flex, Slider } from "antd";
import React from "react";

interface GalleryCardSliderProps {
    setWidth: (width: number) => void;
    currentWidth: number;
}

const GalleryCardSlider: React.FC<GalleryCardSliderProps> = ({ setWidth, currentWidth }) => {
    return (
        <div className="gallery-card-slider">
            <Flex justify="space-between" align="center">
                <label style={{ color: "#BFBFBF" }}>Size:</label>
                <Slider
                    style={{ width: 100 }}
                    min={106} // smallest where the buttons still fit
                    max={256}
                    value={currentWidth}
                    onChange={setWidth}
                    tooltip={{ open: false }}
                />
            </Flex>
        </div>
    );
};

export default GalleryCardSlider;
