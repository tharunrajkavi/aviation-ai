provider "aws" {
  region = "us-east-1"
}

# 1. VPC Setup
resource "aws_vpc" "skycrew_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "skycrew-production-vpc"
  }
}

# Subnets
resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.skycrew_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "skycrew-public-a" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.skycrew_vpc.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "skycrew-private-a" }
}

resource "aws_subnet" "db_a" {
  vpc_id            = aws_vpc.skycrew_vpc.id
  cidr_block        = "10.0.20.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "skycrew-db-a" }
}

resource "aws_subnet" "db_b" {
  vpc_id            = aws_vpc.skycrew_vpc.id
  cidr_block        = "10.0.21.0/24"
  availability_zone = "us-east-1b"
  tags = { Name = "skycrew-db-b" }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.skycrew_vpc.id
  tags   = { Name = "skycrew-igw" }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.skycrew_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "skycrew-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

# 2. Security Groups
resource "aws_security_group" "alb_sg" {
  name        = "skycrew-alb-sg"
  description = "Allow inbound public traffic to ALB"
  vpc_id      = aws_vpc.skycrew_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ec2_sg" {
  name        = "skycrew-ec2-sg"
  description = "Allow traffic from ALB and SSH"
  vpc_id      = aws_vpc.skycrew_vpc.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict to VPN in production
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds_sg" {
  name   = "skycrew-rds-sg"
  vpc_id = aws_vpc.skycrew_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }
}

# 3. RDS PostgreSQL DB
resource "aws_db_subnet_group" "db_subnet_grp" {
  name       = "skycrew-db-subnet-group"
  subnet_ids = [aws_subnet.db_a.id, aws_subnet.db_b.id]
}

resource "aws_db_instance" "postgres" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.medium"
  db_name                = "skycrewdb"
  username               = "postgres"
  password               = "ChangeMe123!" # Replace with Secrets Manager integration
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_grp.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true
}

# 4. Amazon S3 Bucket
resource "aws_s3_bucket" "roster_bucket" {
  bucket        = "skycrew-rosters-reports-prod"
  force_destroy = true
}

# 5. EC2 Server Instance
resource "aws_instance" "app_server" {
  ami                         = "ami-0c7217cdde317cfec" # Ubuntu Server 22.04 LTS
  instance_type               = "t3.medium"
  subnet_id                   = aws_subnet.public_a.id # Deploy in public subnet for direct demo access
  vpc_security_group_ids      = [aws_security_group.ec2_sg.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y docker.io
              sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              sudo chmod +x /usr/local/bin/docker-compose
              sudo systemctl start docker
              sudo systemctl enable docker
              EOF

  tags = {
    Name = "skycrew-app-server"
  }
}

output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
