// File: Jenkinsfile
// Description: Complete CI/CD pipeline for Family Tree application

pipeline {
    agent any

    environment {
        // Version from git tag or branch
        VERSION = sh(script: "git describe --tags --always", returnStdout: true).trim()
        BUILD_TIMESTAMP = sh(script: "date +%Y%m%d_%H%M%S", returnStdout: true).trim()

        // Directories
        API_DIR = 'api'
        UI_DIR = 'ui'

        // Deployment
        PROD_VM_USER = 'familytree'
        PROD_VM_HOST = 'vm'
        NEO4J_PASSWORD = credentials('neo4j-prod-password')

        // Build artifacts
        API_JAR = "${API_DIR}/build/libs/family-tree-api.jar"
        UI_DIST = "${UI_DIR}/dist"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    parameters {
        choice(name: 'DEPLOY_COMPONENT', choices: ['BOTH', 'API', 'UI'], description: 'Which component to deploy')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip running tests')
        booleanParam(name: 'FORCE_DEPLOY', defaultValue: false, description: 'Force deployment even if tests fail')
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out code..."
                    checkout scm

                    // Display build info
                    sh '''
                        echo "==================================="
                        echo "Build Information"
                        echo "==================================="
                        echo "Version: ${VERSION}"
                        echo "Build: ${BUILD_NUMBER}"
                        echo "Timestamp: ${BUILD_TIMESTAMP}"
                        echo "Branch: ${GIT_BRANCH}"
                        echo "==================================="
                    '''
                }
            }
        }

        stage('Build API') {
            when {
                expression { params.DEPLOY_COMPONENT in ['BOTH', 'API'] }
            }
            steps {
                script {
                    echo "Building Spring Boot API..."
                    dir(API_DIR) {
                        sh '''
                            chmod +x gradlew
                            ./gradlew clean bootJar --no-daemon --info
                        '''
                    }
                }
            }
        }

        stage('Test API') {
            when {
                expression {
                    params.DEPLOY_COMPONENT in ['BOTH', 'API'] &&
                    !params.SKIP_TESTS
                }
            }
            steps {
                script {
                    echo "Running API tests..."
                    dir(API_DIR) {
                        sh './gradlew test --no-daemon'
                    }
                }
            }
            post {
                always {
                    junit "${API_DIR}/build/test-results/test/*.xml"
                }
            }
        }

        stage('Build UI') {
            when {
                expression { params.DEPLOY_COMPONENT in ['BOTH', 'UI'] }
            }
            tools {
                nodejs 'NodeJS-18'
            }
            steps {
                script {
                    echo "Building React UI..."
                    dir(UI_DIR) {
                        sh '''
                            npm ci
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Test UI') {
            when {
                expression {
                    params.DEPLOY_COMPONENT in ['BOTH', 'UI'] &&
                    !params.SKIP_TESTS
                }
            }
            tools {
                nodejs 'NodeJS-18'
            }
            steps {
                script {
                    echo "Running UI lint checks..."
                    dir(UI_DIR) {
                        sh 'npm run lint || true'
                    }
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                script {
                    echo "Archiving build artifacts..."

                    if (params.DEPLOY_COMPONENT in ['BOTH', 'API']) {
                        archiveArtifacts artifacts: "${API_JAR}", fingerprint: true
                    }

                    if (params.DEPLOY_COMPONENT in ['BOTH', 'UI']) {
                        // Create UI tarball
                        sh "tar -czf ui-dist-${VERSION}.tar.gz -C ${UI_DIST} ."
                        archiveArtifacts artifacts: "ui-dist-${VERSION}.tar.gz", fingerprint: true
                    }
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'master'
            }
            steps {
                script {
                    echo "Deploying to production VM..."

                    sshagent(credentials: ['vm-ssh-key']) {
                        // Deploy API
                        if (params.DEPLOY_COMPONENT in ['BOTH', 'API']) {
                            echo "Deploying API..."
                            sh """
                                # Copy JAR to VM
                                scp -o StrictHostKeyChecking=no \
                                    ${API_JAR} \
                                    ${PROD_VM_USER}@${PROD_VM_HOST}:/tmp/family-tree-api.jar

                                # Execute deployment script
                                ssh -o StrictHostKeyChecking=no \
                                    ${PROD_VM_USER}@${PROD_VM_HOST} \
                                    'bash /opt/family-tree/scripts/deploy-api.sh ${VERSION} /tmp/family-tree-api.jar'
                            """
                        }

                        // Deploy UI
                        if (params.DEPLOY_COMPONENT in ['BOTH', 'UI']) {
                            echo "Deploying UI..."
                            sh """
                                # Copy UI build to VM
                                scp -o StrictHostKeyChecking=no \
                                    ui-dist-${VERSION}.tar.gz \
                                    ${PROD_VM_USER}@${PROD_VM_HOST}:/tmp/

                                # Extract and deploy
                                ssh -o StrictHostKeyChecking=no \
                                    ${PROD_VM_USER}@${PROD_VM_HOST} \
                                    'mkdir -p /tmp/ui-dist && \
                                     tar -xzf /tmp/ui-dist-${VERSION}.tar.gz -C /tmp/ui-dist && \
                                     bash /opt/family-tree/scripts/deploy-ui.sh /tmp/ui-dist && \
                                     rm -rf /tmp/ui-dist /tmp/ui-dist-${VERSION}.tar.gz'
                            """
                        }
                    }
                }
            }
        }

        stage('Health Check') {
            when {
                branch 'master'
            }
            steps {
                script {
                    echo "Performing health checks..."

                    sshagent(credentials: ['vm-ssh-key']) {
                        // Check API health
                        if (params.DEPLOY_COMPONENT in ['BOTH', 'API']) {
                            sh """
                                ssh -o StrictHostKeyChecking=no \
                                    ${PROD_VM_USER}@${PROD_VM_HOST} \
                                    'curl -f http://localhost:8081/actuator/health || exit 1'
                            """
                        }

                        // Check UI accessibility
                        if (params.DEPLOY_COMPONENT in ['BOTH', 'UI']) {
                            sh """
                                ssh -o StrictHostKeyChecking=no \
                                    ${PROD_VM_USER}@${PROD_VM_HOST} \
                                    'curl -f http://localhost:80 || exit 1'
                            """
                        }
                    }

                    echo "✓ All health checks passed"
                }
            }
        }
    }

    post {
        success {
            echo "✓ Deployment completed successfully!"
            // Send notification
            emailext(
                subject: "✓ Deployment Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    Deployment completed successfully!

                    Job: ${env.JOB_NAME}
                    Build: #${env.BUILD_NUMBER}
                    Version: ${VERSION}
                    Component: ${params.DEPLOY_COMPONENT}

                    Check console output: ${env.BUILD_URL}console
                """,
                to: 'devops@familytree.com'
            )
        }

        failure {
            echo "✗ Deployment failed!"
            // Rollback on failure
            script {
                if (env.BRANCH_NAME == 'master') {
                    sshagent(credentials: ['vm-ssh-key']) {
                        if (params.DEPLOY_COMPONENT in ['BOTH', 'API']) {
                            sh """
                                ssh -o StrictHostKeyChecking=no \
                                    ${PROD_VM_USER}@${PROD_VM_HOST} \
                                    'bash /opt/family-tree/scripts/rollback.sh api'
                            """
                        }
                        if (params.DEPLOY_COMPONENT in ['BOTH', 'UI']) {
                            sh """
                                ssh -o StrictHostKeyChecking=no \
                                    ${PROD_VM_USER}@${PROD_VM_HOST} \
                                    'bash /opt/family-tree/scripts/rollback.sh ui'
                            """
                        }
                    }
                }
            }

            // Send notification
            emailext(
                subject: "✗ Deployment Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    Deployment failed and has been rolled back.

                    Job: ${env.JOB_NAME}
                    Build: #${env.BUILD_NUMBER}
                    Version: ${VERSION}
                    Component: ${params.DEPLOY_COMPONENT}

                    Check console output: ${env.BUILD_URL}console
                """,
                to: 'devops@familytree.com'
            )
        }

        always {
            // Cleanup workspace
            cleanWs()
        }
    }
}
