const { to, set, timeline } = gsap;

let img = new Image();
function validURL(str) {
  let pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return !!pattern.test(str);
}

function delay(fn, ms) {
  let timer = 0;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(this, ...args), ms || 0);
  };
}

document.querySelectorAll(".url-input").forEach((elem) => {
  let icon = elem.querySelector(".icon"),
    favicon = icon.querySelector(".favicon"),
    clear = elem.querySelector(".clear"),
    input = elem.querySelector("input"),
    { classList } = elem,
    svgLine = clear.querySelector(".line"),
    svgLineProxy = new Proxy(
      {
        x: null,
      },
      {
        set(target, key, value) {
          target[key] = value;
          if (target.x !== null) {
            svgLine.setAttribute("d", getPath(target.x, 0.1925));
          }
          return true;
        },
        get(target, key) {
          return target[key];
        },
      }
    );

  svgLineProxy.x = 0;

  input.addEventListener(
    "input",
    delay((e) => {
      let bool = input.value.length,
        valid = validURL(input.value);
      to(elem, {
        "--clear-scale": bool ? 1 : 0,
        duration: bool ? 0.5 : 0.15,
        ease: bool ? "elastic.out(1, .7)" : "none",
      });
      to(elem, {
        "--clear-opacity": bool ? 1 : 0,
        duration: 0.15,
      });
      to(elem, {
        "--icon-offset": valid ? "24px" : "0px",
        duration: 0.15,
        delay: valid ? 0 : 0.2,
      });
      if (valid) {
        if (favicon.querySelector("img")) {
          favicon.querySelector("img").src =
            "https://www.google.com/s2/favicons?domain=" + input.value;
          return;
        }
        img.onload = () => {
          favicon.appendChild(img);
          to(elem, {
            "--favicon-scale": 1,
            duration: 0.5,
            delay: 0.2,
            ease: "elastic.out(1, .7)",
          });
        };
        img.src = "https://www.google.com/s2/favicons?domain=" + input.value;
      } else {
        if (favicon.querySelector("img")) {
          to(elem, {
            "--favicon-scale": 0,
            duration: 0.15,
            onComplete() {
              favicon.querySelector("img").remove();
            },
          });
        }
      }
    }, 250)
  );

  clear.addEventListener("click", (e) => {
    classList.add("clearing");
    set(elem, {
      "--clear-swipe-left": (input.offsetWidth - 44) * -1 + "px",
    });
    to(elem, {
      keyframes: [
        {
          "--clear-rotate": "45deg",
          duration: 0.25,
        },
        {
          "--clear-arrow-x": "2px",
          "--clear-arrow-y": "-2px",
          duration: 0.15,
        },
        {
          "--clear-arrow-x": "-3px",
          "--clear-arrow-y": "3px",
          "--clear-swipe": "-3px",
          duration: 0.15,
          onStart() {
            to(svgLineProxy, {
              x: 3,
              duration: 0.1,
              delay: 0.05,
            });
          },
        },
        {
          "--clear-swipe-x": 1,
          "--clear-x": (input.offsetWidth - 32) * -1 + "px",
          duration: 0.45,
          onComplete() {
            input.value = "";
            input.focus();
            if (favicon.querySelector("img")) {
              to(elem, {
                "--favicon-scale": 0,
                duration: 0.15,
                onComplete() {
                  favicon.querySelector("img").remove();
                },
              });
              to(elem, {
                "--icon-offset": "0px",
                "--icon-offset-line": "0px",
                duration: 0.15,
                delay: 0.2,
              });
            }
            to(elem, {
              "--clear-arrow-offset": "4px",
              "--clear-arrow-offset-second": "4px",
              "--clear-line-array": "8.5px",
              "--clear-line-offset": "27px",
              "--clear-long-offset": "24px",
              "--clear-rotate": "0deg",
              "--clear-arrow-o": 1,
              duration: 0,
              delay: 0.7,
              onStart() {
                classList.remove("clearing");
              },
            });
            to(elem, {
              "--clear-opacity": 0,
              duration: 0.2,
              delay: 0.55,
            });
            to(elem, {
              "--clear-arrow-o": 0,
              "--clear-arrow-x": "0px",
              "--clear-arrow-y": "0px",
              "--clear-swipe": "0px",
              duration: 0.15,
            });
            to(svgLineProxy, {
              x: 0,
              duration: 0.45,
              ease: "elastic.out(1, .75)",
            });
          },
        },
        {
          "--clear-swipe-x": 0,
          "--clear-x": "0px",
          duration: 0.4,
          delay: 0.35,
        },
      ],
    });
    to(elem, {
      "--clear-arrow-offset": "0px",
      "--clear-arrow-offset-second": "8px",
      "--clear-line-array": "28.5px",
      "--clear-line-offset": "57px",
      "--clear-long-offset": "17px",
      duration: 0.2,
    });
  });
});

function getPoint(point, i, a, smoothing) {
  let cp = (current, previous, next, reverse) => {
      let p = previous || current,
        n = next || current,
        o = {
          length: Math.sqrt(
            Math.pow(n[0] - p[0], 2) + Math.pow(n[1] - p[1], 2)
          ),
          angle: Math.atan2(n[1] - p[1], n[0] - p[0]),
        },
        angle = o.angle + (reverse ? Math.PI : 0),
        length = o.length * smoothing;
      return [
        current[0] + Math.cos(angle) * length,
        current[1] + Math.sin(angle) * length,
      ];
    },
    cps = cp(a[i - 1], a[i - 2], point, false),
    cpe = cp(point, a[i - 1], a[i + 1], true);
  return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
}

function getPath(x, smoothing) {
  return [
    [2, 2],
    [12 - x, 12 + x],
    [22, 22],
  ].reduce(
    (acc, point, i, a) =>
      i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${getPoint(point, i, a, smoothing)}`,
    ""
  );
}

const btn = document.querySelector(".btn");
const inp = document.querySelector("input");

btn.addEventListener("click", () => {
  let domain = inp.value;
  if (inp == "") {
   return;
  }else{
    let url = "https://www.google.com/s2/favicons?domain=" + domain;
    btn.href = url;
    btn.download ="favicon.ico";
  }
});