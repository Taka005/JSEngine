import React  from "react";
import { Tooltip } from "./Tooltip";

interface Label {};

type LabelProps = {
  title: string;
  description: string
};

class Label extends React.Component<LabelProps>{
  constructor(props: LabelProps){
    super(props);
  }

  render(): JSX.Element{
    return (
      <>
        <Tooltip description={this.props.description}>
          <h6>{this.props.title}</h6>
        </Tooltip>
      </>
    )
  }
}

export { Label };