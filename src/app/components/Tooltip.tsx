import React from "react";

interface Tooltip {
  textRef: React.RefObject<HTMLDivElement>;
};

type TooltipProps = {
  description: string;
  children: JSX.Element;
};

class Tooltip extends React.Component<TooltipProps>{
  constructor(props: TooltipProps){
    super(props);

    this.textRef = React.createRef();

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleMouseEnter(): void{
    if(!this.textRef.current) return alert("内部エラー: ツールチップの要素が取得できません");

    this.textRef.current.style.opacity = "1";
    this.textRef.current.style.visibility = "visible";
  }

  handleMouseLeave(): void{
    if(!this.textRef.current) return alert("内部エラー: ツールチップの要素が取得できません");

    this.textRef.current.style.opacity = "0";
    this.textRef.current.style.visibility = "hidden";
  }

  render(): JSX.Element{
    return (
      <div className="relative items-center">
        <div
          className="whitespace-nowrap rounded bg-black px-2 py-1 text-white absolute -top-12 left-1/2 -translate-x-1/2 before:content-[''] before:absolute before:-translate-x-1/2 before:left-1/2 before:top-full before:border-4 before:border-transparent before:border-t-black opacity-0 group-hover:opacity-100 transition pointer-events-none"
          ref={this.textRef}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {this.props.description}
        </div>
        <div
          className="text-center"
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

export { Tooltip };