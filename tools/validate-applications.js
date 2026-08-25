#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function readJson(p){ return JSON.parse(fs.readFileSync(path.join(root,p),'utf8')); }
const lessons = readJson('data/lessons.json').items || [];
const apps = readJson('data/applications.json').items || [];
const sims = readJson('data/simulations.json');
const projects = readJson('data/projects.json').items || [];
const lessonIds = new Set(lessons.map(x=>x.id));
const simIds = new Set([...(sims.observation||[]), ...(sims.practice||[]), ...(sims.moduleLabs||[])].map(x=>x.id));
const projectIds = new Set(projects.map(x=>x.id));
let errors = [];
for (const app of apps) {
  if (!app.linkedSimulationId || !simIds.has(app.linkedSimulationId)) errors.push(`Application ${app.id} missing simulation ${app.linkedSimulationId}`);
  if (!app.linkedProjectId || !projectIds.has(app.linkedProjectId)) errors.push(`Application ${app.id} missing project ${app.linkedProjectId}`);
  for (const lid of app.linkedLessonIds || []) if (!lessonIds.has(lid)) errors.push(`Application ${app.id} points to missing lesson ${lid}`);
  if (!app.outputArtifact) errors.push(`Application ${app.id} missing outputArtifact`);
}
let lessonsWithout = lessons.filter(l => l.moduleId && (!l.applicationLabIds || !l.applicationLabIds.length));
if (lessonsWithout.length) errors.push(`${lessonsWithout.length} lessons with moduleId missing applicationLabIds`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(JSON.stringify({ok:true, applications:apps.length, simulations:simIds.size, projects:projects.length, lessonsWithApplication: lessons.length - lessonsWithout.length}, null, 2));
