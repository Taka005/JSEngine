import React from "react";
import { Client } from "../../engine/Client";

interface Canvas{
  canvasRef: React.RefObject<HTMLCanvasElement>;
  client: Client;
};

type CanvasProps = {
  client: Client;
};

class Canvas extends React.Component<CanvasProps>{
  constructor(props: CanvasProps){
    super(props);

    this.canvasRef = React.createRef();
    this.client = props.client;
  }

  componentDidMount(): void{
    const canvas = this.canvasRef.current;
    if(!canvas) return alert("内部エラー: 描画要素が取得できません");

    this.client.setCanvas(canvas);
    this.client.setEngine();
  }

  render(): JSX.Element{
    return (
      <>
        <canvas
          ref={this.canvasRef}
          width="900px"
          height="700px"
        />
      </>
    )
  }
}

export { Canvas };