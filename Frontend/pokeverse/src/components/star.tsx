import React from 'react'
import Image from 'next/image'

type StarProps = {
  fill: boolean;
  width: number;
  height: number;
};

const Star = ({ fill, width, height}: StarProps) => {
  return (
    <Image
      src={fill ? "/starFilled.png" : "/starOutlined.png"}
      width={width}
      height={height}
      alt={fill ? 'Filled Star' : 'Empty Star'}
    />
  );
};

export default Star;
