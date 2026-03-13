// Funções auxiliares gerais para o sistema

/**
 * Formata resposta padrão de sucesso
 * @param {any} data - Dados a retornar
 * @param {string} message - Mensagem opcional
 */
function successResponse(data, message = 'Operação realizada com sucesso') {
    return {
        success: true,
        message,
        data
    };
}

/**
 * Formata resposta padrão de erro
 * @param {string} message - Mensagem de erro
 */
function errorResponse(message = 'Ocorreu um erro') {
    return {
        success: false,
        message
    };
}

/**
 * Valida se uma string é um email válido
 * @param {string} email 
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Gera um ID aleatório simples (pode ser usado para teste ou chaves temporárias)
 */
function generateRandomId(length = 8) {
    return Math.random().toString(36).substr(2, length);
}

// Exporta todas as funções para usar em qualquer lugar do sistema
module.exports = {
    successResponse,
    errorResponse,
    isValidEmail,
    generateRandomId
};