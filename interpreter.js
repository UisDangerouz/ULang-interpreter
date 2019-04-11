//STYLING
$("#input").css('color', 'yellow')
$("#input").css('background-color', '#3a3a3a')
$("#output").css('color', '#00ce29')
$("#output").css('background-color', '#3a3a3a')

//ERROR CODES
function getError(index) {
    const errorCodes = ['Overflow error'];
    if(index) {
        return errorCodes[i];
    } else {
        return errorCodes
    }
}
function hasError(source) {
    const errorCodes = getError();
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
    if(!expression) {
        return '';
    }

    //FINDS INNER BLOCKS AND EVALUETES THEM RECURSIVELY
    let innerBlock = getOutermostBlock(expression, '(', ')');
    while(innerBlock) {
        let evalueatedBlock = evaluate(expression.substring(innerBlock.start + 1, innerBlock.end - 1));
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

function getArrayElement(array, charIndex) {
    let strLenght = 0;
    for(let i = 0; i < array.length; i++) {
        strLenght += array[i].length;
        if(charIndex <= strLenght) {
            return array[i];
        }
    }
}

function multiSplit(str, splitChars){
    var tempChar = splitChars[0];
    for(var i = 1; i < splitChars.length; i++){
        str = str.split(splitChars[i]).join(tempChar);
    }
    str = str.split(tempChar);
    return str;
}

function getOutermostBlock(source, leftChar, rightChar) {
    let characterPos = {};

    //KEEPS TRACK OF HOW MANY INNER BLOCKS THERE ARE
    let blockDepth = 0;
    
    for(let i = 0; i < source.length; i++) {
        if(source.charAt(i) == leftChar) {
            if(!characterPos.start) {
                characterPos.start = i;
            } else {
                blockDepth++;
            }
        } else if(source.charAt(i) == rightChar) {
            break;
        }
    }

    for(let i = characterPos.start; i < source.length; i++) {
        if(source.charAt(i) == rightChar) {
            if(blockDepth == 0) {
                characterPos.end = i + 1;
                break;
            } else {
                blockDepth--;
            }
        }
    }

    if(characterPos && characterPos.start < characterPos.end) {
        return characterPos
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

function getOperatorIndex(source) {
    for(let i = 0; i < source.length; i++) {
        if('+-*/'.includes(source.charAt(i))) {
            return i;
        }
    }
    return false;
}

function charIsOperator(char) {
    if('+-*/'.includes(char)) {
        return true;
    } else {
        return false;
    }
}

function includesAnyChar(source, chars) {
    for(let i = 0; i < chars.length; i++) {
        if(source.includes(chars.charAt(i))) {
            return true;
        }
    }
    return false;
}

function output(text) {
    $('#output').val($('#output').val() + text + '\n');
}
