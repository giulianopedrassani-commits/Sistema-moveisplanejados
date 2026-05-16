/**
 * Middleware para verificar o perfil do usuário (ex: superadmin, admin, usuario)
 * @param {Array} allowedRoles - Lista de papéis permitidos
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }

        if (!allowedRoles.includes(req.user.perfil)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Acesso negado: Perfil sem permissão para esta funcionalidade' 
            });
        }

        next();
    };
};

module.exports = checkRole;
