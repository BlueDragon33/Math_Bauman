import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const json=p=>JSON.parse(readFileSync(p,"utf8"));
const manifest=json(".blueprint/constitution-adoption.json");
const budget=json(".blueprint/dependency-budget.json");
const audit=json("docs/BLUEPRINT-13-SOURCE-ADOPTION-AUDIT.json");
const seven=["structural-capacity","architectural-longevity","product-elegance","premium-usability","long-term-durability","fortress-security-disaster-resilience","operational-sovereignty-dependency-minimization"];
test("active 1.3 inherits all B2 structural obligations, no self-waiver or release privilege",()=>{
 assert.equal(manifest.schemaVersion,"1.0.0");
 assert.equal(manifest.policyId,"blueprint-os:universal-century-grade");
 assert.equal(manifest.policyVersion,"1.3.0");
 assert.equal(manifest.projectId,"project:math-bauman");
 assert.equal(manifest.blueprintLevel,"B2");
 assert.equal(manifest.enforcementMode,"enforced");
 assert.deepEqual(manifest.inheritedPillars,seven);
 assert.deepEqual(manifest.disabledPillars,[]);
 assert.deepEqual(manifest.constitutionalWaivers,[]);
 assert.equal(manifest.evidenceAuthority,"canonical-quality-gates");
 assert.equal(manifest.productionAuthority,"separate-explicit-release-gate");
});
test("local sovereignty remains canonical with optional adapters, no new external dependency",()=>{
 assert.equal(budget.projectId,manifest.projectId);
 assert.equal(budget.policyId,manifest.policyId);
 assert.equal(budget.policyVersion,manifest.policyVersion);
 assert.equal(budget.posture,"LOCAL_CORE_OFFLINE_CAPABLE");
 assert.equal(budget.dependencies.find(x=>x.id==="browser-runtime")?.class,"LOCAL_CORE");
 const ids=new Set(budget.dependencies.map(d=>d.id));
 assert.equal(ids.size,budget.dependencies.length);
 for(const dep of budget.dependencies){
  assert.ok(dep.offlineBehavior&&dep.exitPath&&dep.dataBoundary,"dependency must declare portable offline path: "+dep.id);
  assert.ok(!dep.class.startsWith("MANDATORY_CLOUD"));
 }
 const forbidden=new Set(budget.forbidden);
 for(const id of ["cloud-required-core-lesson-runtime","ai-owned-mathematical-truth","drive-as-canonical-curriculum-authority"])assert.ok(forbidden.has(id),"critical prohibition: "+id);
});
test("source-level file checks are real, but cannot substitute executable offline test",()=>{
 for(const path of ["index.html","editor.html","subject-manifest.json","manifest.webmanifest"])assert.equal(existsSync(path),true,"missing observed source: "+path);
 const home=readFileSync("index.html","utf8");
 assert.match(home,/<main\b/i);
 const math=json("subject-manifest.json");
 assert.equal(math.id,"math");
 const pwa=json("manifest.webmanifest");
 assert.equal(pwa.start_url,"./index.html");
});
test("adoption receipt is source scoped; no offline or product PASS from a manifest",()=>{
 assert.equal(audit.status,"SOURCE_AUDIT_CANDIDATE");
 assert.equal(audit.projectId,manifest.projectId);
 assert.equal(audit.sourceAuthority.version,manifest.policyVersion);
 assert.equal(audit.scope,"SOURCE_POLICY_INHERITANCE_ONLY");
 assert.equal(audit.release.offlineRuntime,"UNVERIFIED");
 assert.equal(audit.release.productAcceptance,"UNVERIFIED");
 assert.equal(audit.release.independentReview,"PENDING");
 assert.equal(audit.release.productionAuthorized,false);
 assert.equal(audit.release.userWorkstationInstalled,false);
 assert.equal(audit.retainedRequirements.allSevenPillars,true);
 assert.equal(audit.retainedRequirements.zeroWaivers,true);
 assert.equal(audit.unverified.length,3);
 for(const path of audit.sourcePaths)assert.equal(existsSync(path),true,"audit source missing: "+path);
});
