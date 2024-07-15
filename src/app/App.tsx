import React from "react";
import { Canvas } from "./components/Canvas";
import { Client } from "../engine/Client";

interface App {
  client: Client;
}

type AppProps = {};

class App extends React.Component<AppProps>{
  constructor(props: AppProps){
    super(props);

    this.client = new Client();
  }

  render(): JSX.Element{
    return (
      <>
        <h1>
          JSEngine
        </h1>
        <Canvas 
          client={this.client}
        />
      </>
    )
  }
}

export { App };