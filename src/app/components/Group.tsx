import React from "react";

interface Group{};

type GroupProps = {
  children: JSX.Element;
};

class Group extends React.Component<GroupProps>{
  constructor(props: GroupProps){
    super(props);
  }

  render(): JSX.Element{
    return (
      <>
        <div>
          {this.props.children}
        </div>
      </>
    )
  }
}

export { Group }