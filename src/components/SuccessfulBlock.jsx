import { onMount } from "solid-js";
import "./SuccessBlock.css"; // Import the CSS file

const SuccessBlock = () => {
  return (
    <div class="container">
      <div class="success-block">
        {/* SVG Icon */}
        <svg
          aria-hidden="true"
          class="icon success-icon"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <use xlink:href="#check" />
        </svg>

        {/* Success Text */}
        <div class="title">
          {/* First Line: "Payment" */}
          <div class="line">
            {["P", "a", "y", "m", "e", "n", "t"].map((letter, index) => (
              <span
                key={index}
                style={{ "animation-delay": `${0.045 * (index + 1)}s` }}
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Second Line: "Successful" */}
          <div class="line">
            {["S", "u", "c", "c", "e", "s", "s", "f", "u", "l"].map(
              (letter, index) => (
                <span
                  key={index}
                  style={{ "animation-delay": `${0.045 * (index + 8)}s` }} // Adjust delay for the second line
                >
                  {letter}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Hidden SVG Definitions */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <defs>
          <symbol id="check" viewBox="0 0 16 16">
            <path
              fill="currentColor"
              d="M8,0C3.6,0,0,3.6,0,8s3.6,8,8,8s8-3.6,8-8S12.4,0,8,0z M7,11.4L3.6,8L5,6.6l2,2l4-4L12.4,6L7,11.4z"
            />
          </symbol>
        </defs>
      </svg>
    </div>
  );
};

export default SuccessBlock;