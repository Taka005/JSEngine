import React from "react";
import { Canvas } from "./components/Canvas";
import { Engine } from "../engine/Engine";

interface App {
  engine: Engine;
  canvasRef: React.RefObject<Canvas>;
}

type AppProps = {};

class App extends React.Component<AppProps>{
  constructor(props: AppProps){
    super(props);

    this.canvasRef = React.createRef();
  }

  componentDidMount(): void{
    const canvasRef = this.canvasRef.current;
    if(!canvasRef) return alert("内部エラー: 描画要素が取得できません\nコード: 0");

    const canvas = canvasRef.canvasRef.current;
    if(!canvas) return alert("内部エラー: 描画要素が取得できません\nコード: 1");

    this.engine = new Engine(canvas);
  }

  render(): JSX.Element{
    return (
      <>
        <h1>
          JSEngine
        </h1>
        <Canvas ref={this.canvasRef} />
      </>
    )
  }
}

export { App };