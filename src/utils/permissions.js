// Permission constants matching backend
export const PERMISSIONS = {
    // Patients
    VIEW_PATIENTS: 'view_patients',
    CREATE_PATIENTS: 'create_patients',
    UPDATE_PATIENTS: 'update_patients',
    DELETE_PATIENTS: 'delete_patients',

    // Encounters
    VIEW_ENCOUNTERS: 'view_encounters',
    CREATE_ENCOUNTERS: 'create_encounters',
    UPDATE_ENCOUNTERS: 'update_encounters',

    // Orders
    VIEW_ORDERS: 'view_orders',
    CREATE_ORDERS: 'create_orders',
    UPDATE_ORDERS: 'update_orders',

    // Results
    VIEW_RESULTS: 'view_results',
    UPDATE_RESULTS: 'update_results',

    // Admin
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',
    VIEW_AUDIT_LOG: 'view_audit_log',
}

// Role constants
export const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    RECEPTIONIST: 'receptionist',
    PHARMACIST: 'pharmacist',
    LAB_TECH: 'lab_technician',
    RADIOLOGIST: 'radiologist',
    PATIENT: 'patient',
}

/**
 * Check if user has a specific role
 * @param {Object} user - User object with roles array
 * @param {string|string[]} roles - Role code(s) to check
 * @returns {boolean}
 */
export function hasRole(user, roles) {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
        return false
    }

    const rolesToCheck = Array.isArray(roles) ? roles : [roles]
    const userRoleCodes = user.roles.map(r => r.code)

    return rolesToCheck.some(role => userRoleCodes.includes(role))
}

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with roles and permissions
 * @param {string|string[]} permissions - Permission code(s) to check
 * @returns {boolean}
 */
export function hasPermission(user, permissions) {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
        return false
    }

    const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions]

    // Collect all permissions from all roles
    const userPermissions = user.roles.reduce((acc, role) => {
        if (role.permissions && Array.isArray(role.permissions)) {
            role.permissions.forEach(permission => {
                acc.add(permission.code)
            })
        }
        return acc
    }, new Set())

    return permissionsToCheck.some(permission => userPermissions.has(permission))
}

/**
 * Check if user can delete a specific resource type
 * @param {Object} user - User object
 * @param {string} resource - Resource type ('patient', 'encounter', etc.)
 * @returns {boolean}
 */
export function canDelete(user, resource) {
    const deletePermissions = {
        patient: PERMISSIONS.DELETE_PATIENTS,
        encounter: PERMISSIONS.UPDATE_ENCOUNTERS, // No explicit delete for encounters
        appointment: PERMISSIONS.UPDATE_ORDERS, // Appointments are managed through updates
    }

    const permission = deletePermissions[resource]
    if (!permission) return false

    return hasPermission(user, permission)
}

/**
 * Check if user can create a specific resource type
 * @param {Object} user - User object
 * @param {string} resource - Resource type
 * @returns {boolean}
 */
export function canCreate(user, resource) {
    const createPermissions = {
        patient: PERMISSIONS.CREATE_PATIENTS,
        encounter: PERMISSIONS.CREATE_ENCOUNTERS,
        order: PERMISSIONS.CREATE_ORDERS,
    }

    const permission = createPermissions[resource]
    if (!permission) return false

    return hasPermission(user, permission)
}

/**
 * Check if user can update a specific resource type
 * @param {Object} user - User object
 * @param {string} resource - Resource type
 * @returns {boolean}
 */
export function canUpdate(user, resource) {
    const updatePermissions = {
        patient: PERMISSIONS.UPDATE_PATIENTS,
        encounter: PERMISSIONS.UPDATE_ENCOUNTERS,
        order: PERMISSIONS.UPDATE_ORDERS,
        result: PERMISSIONS.UPDATE_RESULTS,
    }

    const permission = updatePermissions[resource]
    if (!permission) return false

    return hasPermission(user, permission)
}

/**
 * Check if user is an admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isAdmin(user) {
    return hasRole(user, ROLES.ADMIN)
}

/**
 * Check if user is a doctor
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isDoctor(user) {
    return hasRole(user, ROLES.DOCTOR)
}

/**
 * Get user's role display names
 * @param {Object} user - User object
 * @returns {string[]}
 */
export function getUserRoleNames(user) {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
        return []
    }
    return user.roles.map(r => r.name)
}

/**
 * Get user's primary role (first role)
 * @param {Object} user - User object
 * @returns {string|null}
 */
export function getPrimaryRole(user) {
    if (!user || !user.roles || user.roles.length === 0) {
        return null
    }
    return user.roles[0].name
}
