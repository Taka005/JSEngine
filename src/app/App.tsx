import React from "react";
import { Canvas } from "./components/Canvas";
import { Group } from "./components/Group";
import { Select } from "./components/Select";
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
        <Group>
          <Select client={this.client}/>
        </Group>
      </>
    )
  }
}

export { App };