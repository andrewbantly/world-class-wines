// import { selection } from 'd3';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

console.log(d3.selection)

const width = window.innerWidth;
const height = window.innerHeight;

const svg = select('body').append('svg');
svg.attr('width', width);
svg.attr('height', height)