import { Component } from "react";
import Link from "next/link";
import fetch from "isomorphic-unfetch";

class Votes extends Component {
  static async getInitialProps({ req }) {
    const response = await fetch("https://web-platform-est.herokuapp.com/votes");
    const votes = await response.json();
    return { votes };
  }

  static defaultProps = {
    votes: {
      connectedCount: 0,
      votes: []
    }
  };

  state = {
    subscribe: false,
    subscribed: false,
    voted: false,
    connectedCount: this.props.votes.connectedCount,
    votes: this.props.votes.votes,
    reveal: false,
  };

  handleUserCount = count => this.setState({ connectedCount: count });
  handleVote = votes => {
    if (votes.length === 0) {
      this.setState({ voted: false });
    }
    this.setState({ votes });
  };

  vote = vote => {
    if (this.state.voted) return;
    this.props.socket.emit("votes.vote", {
      value: vote,
      id: this.props.socket.id
    });
    this.setState({ voted: true });
  };

  reset = () => {
    this.props.socket.emit("votes.reset");
    this.setState({reveal: false});
  };
  
  reveal = () => {
    console.log(this.state.votes)
    this.setState({reveal: true})
  };

  handleKeyboard = event => {
    switch (event.keyCode) {
      case 48:
        this.vote(0.5);
        break;
      case 49:
        this.vote(1);
        break;
      case 50:
        this.vote(2);
        break;
      case 51:
        this.vote(3);
        break;
      case 53:
        this.vote(5);
        break;
      case 56:
        this.vote(8);
        break;
      case 114:
        this.reset();
        break;
    }
  };

  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      this.props.socket.on("votes.userCount", this.handleUserCount);
      this.props.socket.on("votes.vote", this.handleVote);
      this.setState({ subscribed: true });
    }
  };
  componentDidMount() {
    document.addEventListener("keypress", this.handleKeyboard);
    this.subscribe();
  }

  componentDidUpdate() {
    this.subscribe();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.socket && !state.subscribe) return { subscribe: true };
    return null;
  }

  // close socket connection
  componentWillUnmount() {
    this.props.socket.off("votes.userCount", this.handleUserCount);
    this.props.socket.off("votes.vote", this.handleVote);
  }

  render() {
    const btnStyles = { padding: "1em", margin: "0.3em", fontSize: "1.5em", border: '3px solid rgb(235, 23, 0)', borderRadius: '5px', background: 'white' };
    return (
      <main style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', maxWidth: '1000px', margin: 'auto'}}>
        <h1>
          {this.state.votes.length} / {this.state.connectedCount} voted
        </h1>
        <p>{this.state.voted ? "You have voted!" : "You have NOT voted!"}</p>
        <button
          style={btnStyles}
          onClick={() => this.vote(0.5)}
          disabled={this.state.voted || this.state.reveal}
        >
          ½
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(1)}
          disabled={this.state.voted || this.state.reveal}
        >
          1
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(2)}
          disabled={this.state.voted || this.state.reveal}
        >
          2
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(3)}
          disabled={this.state.voted || this.state.reveal}
        >
          3
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(5)}
          disabled={this.state.voted || this.state.reveal}
        >
          5
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(8)}
          disabled={this.state.voted || this.state.reveal}
        >
          8
        </button>
        {(this.state.reveal || (this.state.votes.length === this.state.connectedCount)) && (
          <div style={{border: '1px solid #ccc', padding: '1em', borderRadius: '5px'}}>
            <h1>Votes</h1>
            <div style={{ fontSize: "2em", marginBottom: "1em" }}>
              {this.state.votes.join(" - ")}
            </div>
            <div style={{ fontSize: "2em", marginBottom: "1em" }}>
              Avg: {(this.state.votes.reduce(function (accumulator, currentValue) { return accumulator + currentValue }, 0)/ this.state.votes.length).toFixed(2)}
            </div>
          </div>
        )}
        <p>
          <button onClick={this.reset}>reset votes</button>
        </p>
        <p>
          <button onClick={this.reveal}>reveal votes</button>
        </p>
      </main>
    );
  }
}

export default Votes;
