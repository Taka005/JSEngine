import React, { ChangeEvent } from "react";
import { Label } from "./Label";
import { Client } from "../../engine/Client";

interface Select {
  client: Client;
}

type SelectProps = {
  client: Client;
};

class Select extends React.Component<SelectProps>{
  constructor(props: SelectProps){
    super(props);

    this.client = props.client;
  }

  onChange(event: ChangeEvent): void{
    
  }

  render(): JSX.Element{
    return (
      <>
        <Label title="ツール" description="実行する操作を選択します" />
        <select className="form-select" defaultValue="circle" onChange={this.onChange}>
          <option value="circle">円</option>
          <option value="square">四角</option>
          <option value="rope">ロープ</option>
          <option value="ground">地面</option>
          <option value="move">移動</option>
          <option value="connect">接続</option>
          <option value="disConnect">接続解除</option>
          <option value="delete">削除</option>
          <option value="control">操作</option>
          <option value="screen">画面移動</option>
        </select>
      </>
    )
  }
}

export { Select };