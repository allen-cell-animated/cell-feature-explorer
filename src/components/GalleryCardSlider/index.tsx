import { Button, Flex, Slider } from "antd";
import React from "react";

interface GalleryCardSliderProps {
    setWidth: (width: number) => void;
    defaultWidth: number;
    currentWidth: number;
}

const GalleryCardSlider: React.FC<GalleryCardSliderProps> = ({
    setWidth,
    defaultWidth,
    currentWidth,
}) => {
    const handleReset = () => {
        setWidth(defaultWidth);
    };

    return (
        <div className="gallery-card-slider">
            <Flex justify="space-between" align="center">
                <label>Width:</label>
                <Slider
                    style={{ width: 100 }}
                    min={106} // smallest where the buttons still fit
                    max={256}
                    value={currentWidth}
                    onChange={setWidth}
                    tooltip={{ formatter: (value) => `${value}px` }}
                />
                <Button onClick={handleReset}>Reset</Button>
            </Flex>
        </div>
    );
};

export default GalleryCardSlider;
