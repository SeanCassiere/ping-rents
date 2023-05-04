import React from "react";
import { Button as NativeBaseButton, type IButtonProps } from "native-base";

const Button = ({ children, ...props }: IButtonProps) => {
  return (
    <NativeBaseButton
      bgColor="black"
      fontWeight="extrabold"
      size="lg"
      fontSize="lg"
      {...props}
    >
      {children}
    </NativeBaseButton>
  );
};

export default Button;
