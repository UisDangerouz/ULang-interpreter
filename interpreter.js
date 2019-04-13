//STYLING
$("#input").css('color', 'yellow')
$("#input").css('background-color', '#3a3a3a')
$("#output").css('color', '#00ce29')
$("#output").css('background-color', '#3a3a3a')

//ERROR CODES
function getError(index) {
    const errorCodes = ['Overflow error', 'Solve takes 3 arguments', 'No solution found'];

    if(index == -1) {
        return errorCodes;
    } else {
        return errorCodes[index];
    }
}
function hasError(source) {
    const errorCodes = getError(-1);
    for(let i = 0; i < errorCodes.length; i++) {
        if(source.includes(errorCodes[i])) {
            return i;
        }
    }   
    return false;
}

$('#runBtn').click(function() {
    run();
});

function run() {
    $('#output').val('OUTPUT:\n');
    let input = $('#input').val();
    output('=' + input);
    output('=' + evaluate(input));
}

function evaluate(expression) {
    if(!expression || hasError(expression)) {
        return expression;
    }

    //FINDS SOLVE COMMANDS AND EVALUATES THEM FIRST
    let solveBlock = getOutermostBlock(expression, 'solve(', ')')
    while(solveBlock) {
        let args = solveBlock.content.split(',')
        let equation = args[0].split('=');
        let variable = args[1];
        //IF INCORRECT ARGUMENTS GIVES ERROR
        if(!variable || equation.length != 2) {
            return getError(1);
        }

        //BRUTE FORCES EQUATION
        let solutionFound = false;
        for(let testValue = -1000; testValue <= 1000; testValue += 0.05) {
            let leftSide = evaluate(equation[0].replaceAll(variable, testValue));
            let rightSide = evaluate(equation[1].replaceAll(variable, testValue));

            if(Math.abs(leftSide - rightSide) <= 0.1) {
                testValue = Number(testValue).toFixed(3);
                solutionFound = true;
                expression = replaceSection(expression, solveBlock.start, solveBlock.end, testValue);
                output(variable + '=' + testValue);
                break;
            }
        }
        if(!solutionFound) {
            return getError(2);
        }

        solveBlock = getOutermostBlock(expression, 'solve(', ')')
    }
    /*
    let block = getOutermostBlock(expression, 'solve(', ')')
    alert('outermost block start: ' + block.start + ' end: ' + block.end + ' content: ' + block.content);
    alert(expression.substring(block.start, block.end));
    */

    //FINDS INNER BLOCKS AND EVALUETES THEM RECURSIVELY
    let innerBlock = getOutermostBlock(expression, '(', ')');
    while(innerBlock) {
        //alert(innerBlock.content);
        let evalueatedBlock = evaluate(innerBlock.content);
        expression = replaceSection(expression, innerBlock.start, innerBlock.end, evalueatedBlock);

        innerBlock = getOutermostBlock(expression, '(', ')');
        output('=' + expression);
    }
    //EVALUATES STRING FROM LEFT TO RIGHT
    return calculate(expression);
}

function calculate(source) {
    //HALTS RECURSION IF FINDS ERROR CODE
    let errorCode = hasError(source)
    if(errorCode) {
        return errorCode;
    }

    let elements = seperateOperationElements(source);

    if(includesAnyChar(source, '*/')) {
        for(let i = 0; i < elements.length; i++) {
            if('*/'.includes(elements[i])) {
                elements[i] = applyOperator([elements[i-1], elements[i+1]], elements[i]);
                elements[i-1] = '';
                elements[i+1] = '';
                return calculate(elements.join(''));
            }
        }
    } else {
        //WHEN NO MULTIPLY OR DIVISION FOUND, JUST ADDS UP ALL THE NUMBERS
        let sum = 0;
        for(let i = 0; i < elements.length; i++) {
            sum += Number(elements[i]);
        }
        if(isNaN(sum)) {
            return getError(0);
        }
        return sum;
    }
}

function seperateOperationElements(source) {
    let elements = []
    let tempElement = '';

    function addElement(element) {
        if(element.length > 0) {
            elements.unshift(element);
            tempElement = '';
        }
    }

    for(let i = source.length; i >= 0; i--) {
        let char = source.charAt(i)
        if(char == '-') {
            addElement('-' + tempElement);
        } else if(charIsOperator(char)) {
            addElement( tempElement);
            if(char != '+') {
                elements.unshift(char);
            }
        } else {
            tempElement = char + tempElement;
        }
    }
    addElement(tempElement);
    return elements;
}

function getOutermostBlock(source, leftMarker, rightMarker) {
    let block = {};

    //KEEPS TRACK OF HOW MANY INNER BLOCKS THERE ARE
    let blockDepth = 0;
    
    for(let i = 0; i < source.length; i++) {
        if(source.substring(i, i + leftMarker.length) == leftMarker) {
            if(!block.start) {
                block.start = i;
            } else {
                blockDepth++;
            }
        } else if(source.substring(i, i + rightMarker.length) == rightMarker) {
            break;
        }
    }

    for(let i = block.start; i < source.length; i++) {
        if(source.substring(i, i + rightMarker.length) == rightMarker) {
            if(blockDepth == 0) {
                block.end = i + rightMarker.length;
                break;
            } else {
                blockDepth--;
            }
        }
    }

    if(block && block.start < block.end) {
        block.content = source.substring(block.start + leftMarker.length, block.end - 1);
        return block;
    } else {
        return;
    }
}

function replaceSection(source, sectionStart, sectionEnd, section) {
    return source.slice(0, sectionStart) + section + source.slice(sectionEnd);
}

function applyOperator(factors, operator) {
    factors[0] = Number(factors[0]);
    factors[1] = Number(factors[1]);

    if(isNaN(factors[0]) || isNaN(factors[1])) {
        return getError(0);
    }

    if(operator == '+') {
        return factors[0] + factors[1];
    } else if(operator == '-') {
        return factors[0] - factors[1];
    } else if(operator == '*') {
        return factors[0] * factors[1];
    } else if(operator == '/') {
        return factors[0] / factors[1];
    } else {
        return '';
    }
}

function charIsOperator(char) {
    if('+-*/'.includes(char)) {
        return true;
    } else {
        return false;
    }
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function includesAnyChar(source, chars) {
    for(let i = 0; i < chars.length; i++) {
        if(source.includes(chars.charAt(i))) {
            return true;
        }
    }
    return false;
}

function output(text) {
    //CHECKS THAT LAST LINE IS NOT THE SAME AS NEW LINE
    let content = $('#output').val();
    let lastLine = content.split('\n');
    lastLine = lastLine[lastLine.length -2];
    if(lastLine != text) {
        $('#output').val(content + text + '\n');
    }   
}
