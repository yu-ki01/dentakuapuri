document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const display = document.getElementById('display');
    const expressionDisplay = document.getElementById('expression');
    const resultDisplay = document.getElementById('result');
    const buttons = document.querySelectorAll('.button');

    // 電卓の状態を管理する変数
    let currentInput = '0'; // 現在入力されている数値
    let previousInput = ''; // 演算子適用前の数値
    let operator = null;    // 現在選択されている演算子
    let expression = '';    // ディスプレイに表示する計算式
    let equalsPressed = false; // イコールボタンが押されたかどうか

    /**
     * ディスプレイの表示を更新する関数
     */
    const updateDisplay = () => {
        expressionDisplay.textContent = expression;
        resultDisplay.textContent = currentInput;
    };

    /**
     * 数字ボタンがクリックされた時の処理
     * @param {string} number - クリックされた数字（または小数点）
     */
    const handleNumberClick = (number) => {
        if (equalsPressed) {
            // イコールが押された後であれば、新しい計算としてリセット
            currentInput = number;
            expression = '';
            equalsPressed = false;
        } else if (currentInput === '0' && number !== '.') {
            // 初期状態の'0'を置き換える (小数点は除く)
            currentInput = number;
        } else {
            // 数字を追加
            currentInput += number;
        }
        updateDisplay();
    };

    /**
     * 演算子ボタンがクリックされた時の処理
     * @param {string} op - クリックされた演算子の内部名 (例: 'add', 'subtract')
     */
    const handleOperatorClick = (op) => {
        if (operator && previousInput) {
            // 前の計算が未完了の場合、続けて計算を実行
            calculateResult();
        }
        previousInput = currentInput; // 現在の入力を前の入力として保存
        operator = op; // 演算子を設定
        expression = `${previousInput} ${getOperatorSymbol(operator)} `; // 式を更新
        currentInput = '0'; // 次の数字の入力を準備
        equalsPressed = false;
        updateDisplay();
    };

    /**
     * 演算子の内部名を表示用の記号に変換する
     * @param {string} op - 演算子の内部名
     * @returns {string} 表示用の記号
     */
    const getOperatorSymbol = (op) => {
        switch (op) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    };

    /**
     * 計算を実行し、結果を更新する
     */
    const calculateResult = () => {
        // 前の入力または演算子がなければ計算しない
        if (!previousInput || !operator) return;

        let result;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);

        // 数値変換に失敗した場合は何もしない
        if (isNaN(prev) || isNaN(current)) return;

        // 選択された演算子に基づいて計算
        switch (operator) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    result = 'Error'; // 0による除算のハンドリング
                } else {
                    result = prev / current;
                }
                break;
            default:
                return;
        }

        expression = `${previousInput} ${getOperatorSymbol(operator)} ${currentInput} =`; // 完全な式とイコールを表示
        currentInput = result.toString(); // 結果を現在の入力として設定
        operator = null; // 演算子をリセット
        previousInput = ''; // 前の入力をリセット
        equalsPressed = true; // イコールが押された状態にする
        updateDisplay();
    };

    /**
     * クリアボタンがクリックされた時の処理 (全リセット)
     */
    const handleClearClick = () => {
        currentInput = '0';
        previousInput = '';
        operator = null;
        expression = '';
        equalsPressed = false;
        updateDisplay();
    };

    /**
     * バックスペースボタンがクリックされた時の処理
     */
    const handleBackspaceClick = () => {
        if (equalsPressed) return; // イコールが押された直後は何もしない

        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1); // 末尾の文字を削除
        } else {
            currentInput = '0'; // 1文字しかなければ0に戻す
        }
        updateDisplay();
    };

    // すべてのボタンにイベントリスナーを設定
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent;
            const action = button.dataset.action; // data-action属性からアクションを取得

            if (button.classList.contains('number')) {
                handleNumberClick(buttonText);
            } else if (button.classList.contains('operator')) {
                if (action === 'divide' || action === 'multiply' || action === 'subtract' || action === 'add') {
                    handleOperatorClick(action);
                } else if (action === 'backspace') {
                    handleBackspaceClick();
                }
            } else if (button.classList.contains('decimal')) {
                if (!currentInput.includes('.')) { // 小数点がまだ含まれていなければ追加
                    handleNumberClick(buttonText);
                }
            } else if (action === 'equals') {
                calculateResult();
            } else if (action === 'clear') {
                handleClearClick();
            }
        });
    });

    // 初期表示を更新
    updateDisplay();
});
