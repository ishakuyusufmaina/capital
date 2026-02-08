const priorityRule = {
    section: [0,0,0,0,1],
    class: [0,0,0,1,0],
    regStatus: [0,0,1,0,0],
    parent: [0,1,0,0,0],
    id: [1,0,0,0,0]
  }

const flattenSum = arr =>
  arr.reduce((acc, row) =>
    row.map((v, i) => (acc[i] ?? 0) + v)
  , []);

//console.log(flattenSum(Object.values(priorityRule)));
  
//flattenSum([[a, b], [c, d]]); // [a + c, b + d]
  
  function compareSpecificity(A, B) {
  const len = Math.max(A.length, B.length);

  for (let i = 0; i < len; i++) {
    const a = A[i] ?? 0;
    const b = B[i] ?? 0;

    if (a !== b) {
      return a > b ? 1 : -1;
    }
  }

  return 0; // same specificity
}
  
  function sortRules(rules) {
  rules.sort((a, b) => {
    return compareSpecificity(b.value, a.value);
  });
}
  
  function getAppliedRule(rules){
    sortRules(rules);
    return rules[0];
  }
  function evaluateRules(priorityRule, rules){
    rules.forEach(rule=>{
      let {selectors, amount} = rule;
      let subPriorityRule = [];
      selectors.forEach(selector=>{
        let prop = Object.keys(selector)[0];
        subPriorityRule.push(priorityRule[prop]);        
      });
      rule.priorityRule = subPriorityRule;
      rule.value = flattenSum(Object.values(subPriorityRule));
    })
  }
  function getApplicableRules(student, rules){
    const appliedRules = rules
    .filter(rule=>{
      return (ruleApplies(rule))
    });
    return appliedRules;
    function ruleApplies(rule){
      let matchedList = rule.selectors
      .filter(selector=>{
        let [prop, value] = [Object.keys(selector)[0], Object.values(selector)[0]]
        return student[prop] == value;        
      });
      return matchedList.length == rule.selectors.length;
    }
  }
  

