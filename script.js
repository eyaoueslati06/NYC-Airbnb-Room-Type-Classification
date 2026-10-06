// ============================================================
// CONFIG
// ============================================================
// Point this at wherever your FastAPI app is running.
const API_BASE_URL = "http://127.0.0.1:8000";
const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;
const HEALTH_ENDPOINT = `${API_BASE_URL}/`;

const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


const $ = id => document.getElementById(id);

const CITY = {
  "Manhattan": { c:[40.7831,-73.9712], n:["Harlem","East Harlem","Upper West Side","Upper East Side","Midtown","Hell's Kitchen","Chelsea","East Village","West Village","Greenwich Village","SoHo","Lower East Side","Chinatown","Financial District","Washington Heights","Inwood","Murray Hill","Gramercy","Nolita","Tribeca"] },
  "Brooklyn":  { c:[40.6782,-73.9442], n:["Williamsburg","Bedford-Stuyvesant","Bushwick","Greenpoint","Crown Heights","Park Slope","Flatbush","Clinton Hill","Fort Greene","Sunset Park","East Flatbush","Prospect-Lefferts Gardens","Brooklyn Heights","Red Hook","DUMBO","Bay Ridge","Coney Island"] },
  "Queens":    { c:[40.7282,-73.7949], n:["Astoria","Long Island City","Ridgewood","Flushing","Sunnyside","Jamaica","Woodside","Forest Hills","Jackson Heights","Elmhurst","Rockaway Beach","Ditmars Steinway"] },
  "Bronx":     { c:[40.8448,-73.8648], n:["Mott Haven","Kingsbridge","Concourse","Fordham","Riverdale","Williamsbridge","Port Morris","Longwood","Morrisania"] },
  "Staten Island": { c:[40.5795,-74.1502], n:["St. George","Tompkinsville","Stapleton","New Springville","Great Kills","Port Richmond","Tottenville"] }
};
const LABELS = ["Entire home/apt","Private room","Shared room"]; // alphabetical, like sklearn's classes_
const NUM = ["price","minimum_nights","availability_365","number_of_reviews","reviews_per_month","calculated_host_listings_count"];

/* ---------- form wiring ---------- */
const group = $("neighbourhood_group");
Object.keys(CITY).forEach(g => group.add(new Option(g, g)));

function setGroup(){
  const g = CITY[group.value];
  $("hoods").innerHTML = g.n.map(n => `<option value="${n}">`).join("");
  $("neighbourhood").value = g.n[0];
  $("latitude").value  = (g.c[0] + (Math.random()-.5)*.03).toFixed(5);
  $("longitude").value = (g.c[1] + (Math.random()-.5)*.03).toFixed(5);
}
group.addEventListener("change", setGroup);
setGroup();

function syncSlider(el){
  const pct = (el.value - el.min) / (el.max - el.min) * 100;
  el.style.setProperty("--p", pct + "%");
  const out = el.parentElement.querySelector("output");
  out.textContent = (out.dataset.fmt || "") + el.value;
}
NUM.forEach(id => { const el = $(id); syncSlider(el); el.addEventListener("input", () => syncSlider(el)); });

/* ---------- predict ---------- */
$("form").addEventListener("submit", async e => {
  e.preventDefault();
  const body = {
    latitude: parseFloat($("latitude").value),
    longitude: parseFloat($("longitude").value),
    neighbourhood_group: group.value,
    neighbourhood: $("neighbourhood").value.trim()
  };
  NUM.forEach(id => body[id] = Number($(id).value));

  let ok = true;
  ["latitude","longitude","neighbourhood"].forEach(id => {
    const bad = !$(id).value.trim() || Number.isNaN(parseFloat($(id).value)) && id !== "neighbourhood";
    $(id).classList.toggle("bad", bad); ok = ok && !bad;
  });
  if (!ok) return shake();

  const btn = $("go"); btn.classList.add("loading"); btn.disabled = true;
  try{
    const r = await fetch(PREDICT_ENDPOINT, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(data.detail || data));
    show(data);
  }catch(err){
    $("result").innerHTML = `<div class="err"><b>Couldn't get a prediction</b>${err.message}<br><small>Check that the API is running at the address under the form.</small></div>`;
    shake();
  }finally{ btn.classList.remove("loading"); btn.disabled = false; }
});

function shake(){ const p=$("form"); p.classList.remove("shake"); void p.offsetWidth; p.classList.add("shake"); }

function show(d){
  const probs = d.Probability;
  const names = probs.length === 4 ? ["Entire home/apt","Hotel room","Private room","Shared room"] : LABELS;
  const top = probs.indexOf(Math.max(...probs));
  const label = d.Predicted_room_type || names[top];
  $("result").innerHTML = `
    <div class="out">
      <small>The model thinks this is a</small>
      <div class="verdict">${label}</div>
      <div class="conf"><span id="count">0</span>% confident</div>
      ${probs.map((p,i)=>`
        <div class="bar ${i===top?"top":""}">
          <div><span>${names[i] || "Class "+i}</span><span>${(p*100).toFixed(1)}%</span></div>
          <div class="track"><div class="fill" data-w="${p*100}"></div></div>
        </div>`).join("")}
    </div>`;
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.querySelectorAll(".fill").forEach(f => f.style.width = f.dataset.w + "%")));
  countUp($("count"), probs[top]*100);
  burst();
}

function countUp(el, to){
  const t0 = performance.now();
  (function tick(t){
    const k = Math.min((t-t0)/1100,1);
    el.textContent = (to*(1-Math.pow(1-k,3))).toFixed(1);
    if (k<1) requestAnimationFrame(tick);
  })(t0);
}

/* ---------- night-sky background: drifting lit windows ---------- */
const cv = $("sky"), cx = cv.getContext("2d");
let W, H, dots = [], sparks = [];
function resize(){
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  dots = Array.from({length: Math.floor(W*H/9000)}, () => ({
    x:Math.random()*W, y:Math.random()*H, s:1+Math.random()*2.2,
    v:.05+Math.random()*.2, p:Math.random()*6.28, w:Math.random()<.2
  }));
}
addEventListener("resize", resize); resize();

function burst(){
  const r = $("result").getBoundingClientRect();
  for (let i=0;i<70;i++){
    const a = Math.random()*6.28, s = 2+Math.random()*6;
    sparks.push({x:r.left+r.width/2, y:r.top+r.height/3, vx:Math.cos(a)*s, vy:Math.sin(a)*s-2, l:1, c:Math.random()<.5?"255,180,84":"255,122,89"});
  }
}
(function draw(t=0){
  cx.clearRect(0,0,W,H);
  dots.forEach(d => {
    d.y -= d.v; if (d.y < -4){ d.y = H+4; d.x = Math.random()*W; }
    const a = .25 + .35*Math.sin(t/900 + d.p);
    cx.fillStyle = d.w ? `rgba(255,180,84,${a})` : `rgba(140,150,255,${a*.6})`;
    cx.fillRect(d.x, d.y, d.s, d.s);
  });
  sparks = sparks.filter(s => s.l > 0);
  sparks.forEach(s => {
    s.x+=s.vx; s.y+=s.vy; s.vy+=.15; s.vx*=.98; s.l-=.015;
    cx.fillStyle = `rgba(${s.c},${s.l})`; cx.fillRect(s.x, s.y, 4, 4);
  });
  requestAnimationFrame(draw);
})();