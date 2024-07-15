import React from "react";

interface Tooltip {
  textRef: React.RefObject<HTMLDivElement>;
}

type TooltipProps = {
  description: string;
  children: JSX.Element;
};

class Tooltip extends React.Component<TooltipProps>{
  constructor(props: TooltipProps){
    super(props);

    this.textRef = React.createRef();
  }

  onMouseEnter(): void{
    if(!this.textRef.current) return;
    this.textRef.current.style.opacity = "1";
    this.textRef.current.style.visibility = "visible";
  }

  onMouseLeave(): void{
    if(!this.textRef.current) return;
    this.textRef.current.style.opacity = "0";
    this.textRef.current.style.visibility = "hidden";
  }

  render(): JSX.Element{
    return (
      <div className="flex relative items-center">
        <div
          className="flex before:block absolute before:absolute top-full before:-top-1 left-1/2 before:left-1/2 invisible z-10 before:z-0 items-center py-[2px] px-2 mx-auto mt-2 before:w-2 before:h-2 text-xs text-white whitespace-nowrap before:bg-black bg-black rounded transition-all duration-150 transform before:transform before:rotate-45 -translate-x-1/2 before:-translate-x-1/2"
          ref={this.textRef}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          {this.props.description}
        </div>
        <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export { Tooltip };